import type { z } from "zod";
import { Entity } from "~/applications/Shared/Domain/Core/Entity";
import { UniqueEntityID } from "~/applications/Shared/Domain/Core/UniqueEntityId";
import type { ShoppingListPayload } from "../Schemas/ShoppingList.schema";
import type { UserRoleEnum } from "../Schemas/UserRole.schema";
import type { ShoppingListCollaborator } from "./ShoppingListCollaborator.entity";
import type { ShoppingListItem } from "./ShoppingListItem.entity";

export type UserRole = z.infer<typeof UserRoleEnum>;

interface ShoppingListProps {
  name: string;
  description?: string;
  userId: string;
  items: ShoppingListItem[];
  collaborators?: ShoppingListCollaborator[];
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ShoppingList extends Entity<ShoppingListProps> {
  private constructor(props: ShoppingListProps, id?: string) {
    super(props, new UniqueEntityID(id));
  }

  public static create(
    props: {
      name: string;
      description?: string;
      userId: string;
      items?: ShoppingListItem[];
      collaborators?: ShoppingListCollaborator[];
      isPublic?: boolean;
    },
    id?: string
  ): ShoppingList {
    return new ShoppingList(
      {
        name: props.name,
        description: props.description,
        userId: props.userId,
        items: props.items || [],
        collaborators: props.collaborators || [],
        isPublic: props.isPublic ?? false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      id
    );
  }

  get id(): string {
    return this._id.toString();
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get userId(): string {
    return this.props.userId;
  }

  get collaborators(): ShoppingListCollaborator[] | undefined {
    return this.props.collaborators;
  }

  get items(): ShoppingListItem[] {
    return this.props.items;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get isPublic(): boolean {
    return this.props.isPublic;
  }

  public withName(name: string): ShoppingList {
    return new ShoppingList(
      {
        ...this.props,
        name,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withDescription(description: string): ShoppingList {
    return new ShoppingList(
      {
        ...this.props,
        description,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withUpdates(updates: Partial<{ name: string; description: string }>): ShoppingList {
    let updatedList: ShoppingList = this;

    if (updates.name !== undefined) {
      updatedList = updatedList.withName(updates.name);
    }

    if (updates.description !== undefined) {
      updatedList = updatedList.withDescription(updates.description);
    }

    return updatedList;
  }

  public getItemById(itemId: string): ShoppingListItem | undefined {
    return this.props.items.find((item) => item.id === itemId);
  }

  public getCompletedItems(): ShoppingListItem[] {
    return this.props.items.filter((item) => item.isCompleted);
  }

  public getPendingItems(): ShoppingListItem[] {
    return this.props.items.filter((item) => !item.isCompleted);
  }

  public get totalItems(): number {
    return this.props.items.length;
  }

  public get completedItems(): number {
    return this.getCompletedItems().length;
  }

  public get progressPercentage(): number {
    if (this.totalItems === 0) return 0;
    return Math.round((this.completedItems / this.totalItems) * 100);
  }

  public get totalPrice(): number {
    // TODO: Calculer depuis les prix des produits
    return 0;
  }

  public get totalPendingPrice(): number {
    // TODO: Calculer depuis les prix des produits
    return 0;
  }

  public get totalCompletedPrice(): number {
    // TODO: Calculer depuis les prix des produits
    return 0;
  }

  public isEmpty(): boolean {
    return this.props.items.length === 0;
  }

  public canBeShared(): boolean {
    return !!this.name?.trim();
  }

  public canUserModify(userId: string, userRole?: string): boolean {
    if (this.userId === userId) return true;

    if (userRole === "EDITOR") return true;

    return false;
  }

  public canUserView(userId: string, userRole?: string): boolean {
    if (this.userId === userId) return true;

    if (userRole) return true;

    return false;
  }

  public getUserRole(userId: string): string | null {
    if (this.userId === userId) return "OWNER";

    const collaborator = this.collaborators?.find((c) => c.userId === userId);
    return collaborator?.role || null;
  }

  public isOwner(userId: string): boolean {
    return this.userId === userId;
  }

  public isUserCollaborator(userId: string): boolean {
    if (this.userId === userId) return true;

    return this.collaborators?.some((collaborator) => collaborator.userId === userId) || false;
  }

  public canUserShare(userId: string): boolean {
    return this.userId === userId;
  }

  public toObject(): ShoppingListPayload {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      userId: this.userId,
      isPublic: this.isPublic,
      items: this.items.map((item) => item.toObject()),
      collaborators: this.collaborators?.map((collaborator) => collaborator.toObject()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      totalItems: this.totalItems,
      completedItems: this.completedItems,
      progressPercentage: this.progressPercentage,
      totalPrice: this.totalPrice,
      totalPendingPrice: this.totalPendingPrice,
      totalCompletedPrice: this.totalCompletedPrice
    };
  }
}
