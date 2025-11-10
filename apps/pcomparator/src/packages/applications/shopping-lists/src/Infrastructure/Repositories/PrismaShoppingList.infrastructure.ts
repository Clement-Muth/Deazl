import { InfrastructureError } from "@deazl/shared";
import { prisma } from "@deazl/system";
import type { ShoppingList } from "../../Domain/Entities/ShoppingList.entity";
import type { ShoppingListRepository } from "../../Domain/Repositories/ShoppingListRepository";
import type { ShoppingListQuery } from "../../Domain/ValueObjects/ShoppingListQuery.vo";
import { ShoppingListMapper } from "../../Infrastructure/Mappers/ShoppingListMapper";
import { ShoppingListInfraSchema } from "../../Infrastructure/Schemas/ShoppingList.schema";

export class PrismaShoppingListRepository implements ShoppingListRepository {
  async save(list: ShoppingList): Promise<ShoppingList> {
    try {
      const persistenceData = ShoppingListMapper.toPersistence(list);

      const updatedList = await prisma.shoppingList.upsert({
        where: { id: list.id },
        create: persistenceData,
        update: persistenceData,
        include: {
          items: {
            include: {
              product: true
            }
          },
          collaborators: {
            include: {
              user: true
            }
          }
        }
      });

      const listPayload = ShoppingListInfraSchema.parse(updatedList);

      return ShoppingListMapper.toDomain(listPayload);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Record to update not found")) {
        throw new Error(`Shopping list with id ${list.id} not found`);
      }
      throw new Error(
        `Failed to save shopping list: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async findManyByQuery(query: ShoppingListQuery): Promise<ShoppingList[]> {
    try {
      const whereClause: any = {};
      const include = {
        items: {
          include: {
            product: true
          }
        },
        collaborators: {
          include: {
            user: true
          }
        }
      };

      if (query.userId && query.collaboratorUserId)
        whereClause.OR = [
          { userId: query.userId },
          {
            collaborators: {
              some: {
                userId: query.collaboratorUserId
              }
            }
          }
        ];
      else if (query.userId) whereClause.userId = query.userId;
      else if (query.collaboratorUserId)
        whereClause.collaborators = {
          some: {
            userId: query.collaboratorUserId
          }
        };

      if (query.name)
        whereClause.name = {
          contains: query.name,
          mode: "insensitive"
        };

      if (query.isShared !== undefined) {
        if (query.isShared)
          whereClause.collaborators = {
            some: {}
          };
        else
          whereClause.collaborators = {
            none: {}
          };
      }

      const lists = await prisma.shoppingList.findMany({
        where: whereClause,
        include,
        orderBy: query.orderBy || { updatedAt: "desc" },
        take: query.limit,
        skip: query.offset
      });

      const listPayloads = lists.map((list) => ShoppingListInfraSchema.parse(list));

      return listPayloads.map((list) => ShoppingListMapper.toDomain(list));
    } catch (error) {
      throw new InfrastructureError(
        "Failed to query shopping lists",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async remove(shoppingListId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.shoppingListItem.deleteMany({
          where: { shoppingListId: shoppingListId }
        });

        await tx.shoppingListCollaborator.deleteMany({
          where: { listId: shoppingListId }
        });

        await tx.shoppingList.delete({
          where: { id: shoppingListId }
        });
      });
    } catch (error) {
      throw new InfrastructureError(
        "Failed to remove shoppingList through API",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async findById(shoppingListId: string): Promise<ShoppingList | null> {
    try {
      const list = await prisma.shoppingList.findUnique({
        where: { id: shoppingListId },
        include: {
          items: {
            include: {
              product: true
            }
          },
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
    } catch (error) {
      throw new InfrastructureError(
        "Failed to find shopping list by ID",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}
