import type { z } from "zod";
import { Entity } from "~/applications/Shared/Domain/Core/Entity";
import { UniqueEntityID } from "~/applications/Shared/Domain/Core/UniqueEntityId";
import type { RecipeCollaboratorSchema } from "../Schemas/RecipeSharing.schema";

export enum RecipeRole {
  OWNER = "OWNER",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER"
}

interface CollaboratorProps {
  recipeId: string;
  userId: string;
  role: RecipeRole;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type RecipeCollaboratorPayload = z.infer<typeof RecipeCollaboratorSchema>;

export class RecipeCollaborator extends Entity<CollaboratorProps> {
  private constructor(props: CollaboratorProps, id?: string) {
    super(props, new UniqueEntityID(id));
  }

  public static create(props: CollaboratorProps, id?: string): RecipeCollaborator {
    return new RecipeCollaborator(
      {
        ...props,
        createdAt: props.createdAt || new Date(),
        updatedAt: props.updatedAt || new Date()
      },
      id
    );
  }

  get collaboratorId(): string {
    return this._id.toString();
  }

  get recipeId(): string {
    return this.props.recipeId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get role(): RecipeRole {
    return this.props.role;
  }

  get user(): CollaboratorProps["user"] {
    return this.props.user;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public isOwner(): boolean {
    return this.props.role === RecipeRole.OWNER;
  }

  public canEdit(): boolean {
    return this.props.role === RecipeRole.OWNER || this.props.role === RecipeRole.EDITOR;
  }

  public canView(): boolean {
    return true; // All collaborators can view
  }

  public toObject(): RecipeCollaboratorPayload {
    return {
      id: this._id.toString(),
      recipeId: this.props.recipeId,
      userId: this.props.userId,
      role: this.props.role,
      user: this.props.user || null
    };
  }
}
