import { prisma } from "@deazl/system";
import { v4 as uuidv4 } from "uuid";
import type { ShoppingList } from "../../Domain/Entities/ShoppingList.entity";
import type {
  CollaboratorRole,
  ShoppingListCollaborator
} from "../../Domain/Entities/ShoppingListCollaborator.entity";
import type { ShoppingListSharingRepository } from "../../Domain/Repositories/ShoppingListSharingRepository";
import { ShoppingListCollaboratorMapper } from "../Mappers/ShoppingListCollaboratorMapper";
import { ShoppingListMapper } from "../Mappers/ShoppingListMapper";
import { ShoppingListInfraSchema } from "../Schemas/ShoppingList.schema";

/**
 * Implémentation Prisma du repository pour le partage des listes de courses
 *
 * Responsabilités (selon les principes DDD) :
 * - Gérer les opérations de partage et collaboration sur les listes
 * - Persister les collaborateurs et leurs rôles
 * - Gérer les tokens de partage public
 * - Rechercher les utilisateurs pour le partage
 *
 * Ce repository est spécialisé dans les aspects de partage et collaboration
 * et utilise des transactions pour garantir la cohérence des données
 */
export class PrismaShoppingListSharingRepository implements ShoppingListSharingRepository {
  async findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    });
    return user;
  }

  async findUserById(id: string): Promise<{ id: string; email: string } | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true
      }
    });
  }

  async generateShareToken(listId: string): Promise<string> {
    const token = uuidv4();
    await prisma.shoppingList.update({
      where: { id: listId },
      data: { shareToken: token }
    });
    return token;
  }

  async getByShareToken(token: string): Promise<ShoppingList | null> {
    const list = await prisma.shoppingList.findUnique({
      where: { shareToken: token },
      include: {
        items: true,
        collaborators: {
          include: {
            user: true
          }
        }
      }
    });

    if (!list) return null;

    const listPayload = ShoppingListInfraSchema.parse(list);

    return ShoppingListMapper.toDomain(listPayload);
  }

  async updatePublicStatus(listId: string, isPublic: boolean): Promise<void> {
    await prisma.shoppingList.update({
      where: { id: listId },
      data: { isPublic }
    });
  }

  async addCollaborator(
    listId: string,
    email: string,
    role: CollaboratorRole
  ): Promise<ShoppingListCollaborator> {
    try {
      // First find the user by email
      const user = await this.findUserByEmail(email);
      if (!user) {
        throw new Error(`User with email ${email} not found`);
      }

      // Use a transaction to ensure all operations complete or none do
      const collaborator = await prisma.$transaction(async (tx) => {
        // Check if the user is already a collaborator
        const existingCollaborator = await tx.shoppingListCollaborator.findFirst({
          where: {
            listId: listId,
            userId: user.id
          }
        });

        if (existingCollaborator) {
          // If they are, update their role instead of creating a new collaboration
          const updated = await tx.shoppingListCollaborator.update({
            where: { id: existingCollaborator.id },
            data: { role },
            include: { user: true }
          });
          return updated;
        }

        // Add the user as a collaborator if they don't exist
        return tx.shoppingListCollaborator.create({
          data: {
            id: uuidv4(),
            listId: listId,
            userId: user.id,
            role
          },
          include: {
            user: true
          }
        });
      });

      return ShoppingListCollaboratorMapper.toDomain(collaborator);
    } catch (error) {
      console.error("Error in addCollaborator:", error);
      throw new Error(
        `Failed to add collaborator: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async removeCollaborator(listId: string, userId: string): Promise<void> {
    await prisma.shoppingListCollaborator.deleteMany({
      where: {
        listId,
        userId
      }
    });
  }

  async updateCollaboratorRole(listId: string, userId: string, role: CollaboratorRole): Promise<void> {
    await prisma.shoppingListCollaborator.updateMany({
      where: {
        listId,
        userId
      },
      data: { role }
    });
  }

  async getCollaborators(listId: string): Promise<ShoppingListCollaborator[]> {
    const collaborators = await prisma.shoppingListCollaborator.findMany({
      where: { listId },
      include: { user: true }
    });

    return collaborators.map((c) => ShoppingListCollaboratorMapper.toDomain(c));
  }
}
