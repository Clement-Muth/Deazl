import type { z } from "zod";
import { Entity } from "~/applications/Shared/Domain/Core/Entity";
import { UniqueEntityID } from "~/applications/Shared/Domain/Core/UniqueEntityId";
import type { ShoppingListCollaboratorSchema } from "../Schemas/ShoppingList.schema";

export enum CollaboratorRole {
  OWNER = "OWNER",
  EDITOR = "EDITOR",
  VIEWER = "VIEWER"
}

interface CollaboratorProps {
  listId: string;
  userId: string;
  role: CollaboratorRole;
  createdAt: Date;
  updatedAt: Date;
}

export type ShoppingListCollaboratorPayload = z.infer<typeof ShoppingListCollaboratorSchema>;

export class ShoppingListCollaborator extends Entity<CollaboratorProps> {
  private constructor(props: CollaboratorProps, id?: string) {
    super(props, new UniqueEntityID(id));
  }

  public static create(props: CollaboratorProps, id?: string): ShoppingListCollaborator {
    return new ShoppingListCollaborator(
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

  get listId(): string {
    return this.props.listId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get role(): CollaboratorRole {
    return this.props.role;
  }

  public toObject(): ShoppingListCollaboratorPayload {
    return {
      id: this._id.toString(),
      listId: this.props.listId,
      userId: this.props.userId,
      role: this.props.role,
      // @ts-ignore
      user: null
      // createdAt: this.props.createdAt,
      // updatedAt: this.props.updatedAt
    };
  }
}
