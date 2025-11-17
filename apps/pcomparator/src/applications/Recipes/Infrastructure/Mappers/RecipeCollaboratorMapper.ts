import type { RecipeCollaborator as RecipeCollaboratorPrisma, User } from "@prisma/client";
import { RecipeCollaborator } from "../../Domain/Entities/RecipeCollaborator.entity";

export class RecipeCollaboratorMapper {
  static toDomain(prismaCollaborator: RecipeCollaboratorPrisma & { user: User }): RecipeCollaborator {
    return RecipeCollaborator.create(
      {
        recipeId: prismaCollaborator.recipeId,
        userId: prismaCollaborator.userId,
        role: prismaCollaborator.role as any,
        user: {
          id: prismaCollaborator.user.id,
          name: prismaCollaborator.user.name,
          email: prismaCollaborator.user.email,
          image: prismaCollaborator.user.image
        },
        createdAt: prismaCollaborator.createdAt,
        updatedAt: prismaCollaborator.updatedAt
      },
      prismaCollaborator.id
    );
  }

  static toPersistence(
    domainCollaborator: RecipeCollaborator
  ): Omit<RecipeCollaboratorPrisma, "createdAt" | "updatedAt"> {
    return {
      id: domainCollaborator.collaboratorId,
      recipeId: domainCollaborator.recipeId,
      userId: domainCollaborator.userId,
      role: domainCollaborator.role as any
    };
  }
}
