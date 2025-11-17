import type { ShoppingListCollaborator as ShoppingListCollaboratorPrisma } from "@prisma/client";
import type { User } from "@prisma/client";
import type { ShoppingListCollaborator } from "../../Domain/Entities/ShoppingListCollaborator.entity";

export class ShoppingListCollaboratorMapper {
  static toDomain(
    prismaCollaborator: ShoppingListCollaboratorPrisma & { user: User }
  ): ShoppingListCollaborator {
    return {
      id: prismaCollaborator.id,
      listId: prismaCollaborator.listId,
      userId: prismaCollaborator.userId,
      // @ts-ignore
      role: prismaCollaborator.role,
      createdAt: prismaCollaborator.createdAt,
      updatedAt: prismaCollaborator.updatedAt,
      user: {
        id: prismaCollaborator.user.id,
        name: prismaCollaborator.user.name,
        email: prismaCollaborator.user.email,
        image: prismaCollaborator.user.image
      }
    };
  }

  static toPersistence(
    domainCollaborator: ShoppingListCollaborator
  ): Omit<ShoppingListCollaboratorPrisma, "createdAt" | "updatedAt"> {
    return {
      // @ts-ignore
      id: domainCollaborator.id,
      listId: domainCollaborator.listId,
      userId: domainCollaborator.userId,
      role: domainCollaborator.role
    };
  }
}
