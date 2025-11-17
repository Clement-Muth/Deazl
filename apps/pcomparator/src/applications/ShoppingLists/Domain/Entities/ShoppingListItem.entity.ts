import { z } from "zod";
import { DomainError } from "~/applications/Shared/Domain/Core/DomainError";
import { Entity } from "~/applications/Shared/Domain/Core/Entity";
import { UniqueEntityID } from "~/applications/Shared/Domain/Core/UniqueEntityId";
import { BusinessRuleViolationError } from "../Errors/ShoppingListItemEntity.error";
import type { ShoppingListItemSchema } from "../Schemas/ShoppingListItem.schema";
import { ItemQuantity } from "../ValueObjects/ItemQuantity.vo";
import { ItemStatus } from "../ValueObjects/ItemStatus.vo";
import { Unit } from "../ValueObjects/Unit.vo";

export class ItemNameTooShortError extends DomainError {
  constructor() {
    super("Item name must be at least 2 characters long");
  }
}

export type ShoppingListItemPayload = z.infer<typeof ShoppingListItemSchema>;

export interface ShoppingListItemProps {
  shoppingListId: string;
  productId: string | null;
  recipeId?: string | null; // ID de la recette source
  recipeName?: string | null; // Cache du nom de la recette pour affichage
  quantity: ItemQuantity;
  unit: Unit;
  status: ItemStatus;
  selectedPriceId?: string | null;
  notes?: string | null;
  product?: {
    id: string;
    name: string;
    barcode: string;
    description: string | null;
  } | null;
  selectedPrice?: {
    id: string;
    amount: number;
    currency: string;
    unit: string;
    store: {
      id: string;
      name: string;
      location: string;
    };
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ShoppingListItem extends Entity<ShoppingListItemProps> {
  private constructor(props: ShoppingListItemProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create(
    props: {
      shoppingListId: string;
      productId: string | null;
      recipeId?: string | null;
      recipeName?: string | null;
      quantity: number;
      unit: string;
      isCompleted?: boolean;
      selectedPriceId?: string | null;
      notes?: string | null;
      product?: {
        id: string;
        name: string;
        barcode: string;
        description: string | null;
      } | null;
      selectedPrice?: {
        id: string;
        amount: number;
        currency: string;
        unit: string;
        store: {
          id: string;
          name: string;
          location: string;
        };
      } | null;
    },
    id?: string
  ): ShoppingListItem {
    const itemEntity = new ShoppingListItem(
      {
        shoppingListId: props.shoppingListId,
        productId: props.productId,
        recipeId: props.recipeId,
        recipeName: props.recipeName,
        quantity: ItemQuantity.create(props.quantity),
        unit: Unit.create(props.unit),
        status: ItemStatus.create(props.isCompleted || false),
        selectedPriceId: props.selectedPriceId,
        notes: props.notes,
        product: props.product,
        selectedPrice: props.selectedPrice,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      id ? new UniqueEntityID(id) : undefined
    );

    return itemEntity;
  }

  public withUpdates(
    updates: Partial<Pick<ShoppingListItemPayload, "quantity" | "unit" | "isCompleted">>,
    shoppingListItemId: string
  ): ShoppingListItem {
    try {
      return ShoppingListItem.create(
        {
          shoppingListId: this.shoppingListId,
          productId: this.productId,
          quantity: updates.quantity ?? this.quantity,
          unit: updates.unit ?? this.unit,
          isCompleted: updates.isCompleted ?? this.isCompleted
        },
        shoppingListItemId
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];

        throw new BusinessRuleViolationError(firstError.message);
      }
      throw error;
    }
  }

  get id(): string {
    return this._id.toString();
  }

  get shoppingListId(): string {
    return this.props.shoppingListId;
  }

  get productId(): string | null {
    return this.props.productId;
  }

  get product():
    | {
        id: string;
        name: string;
        barcode: string;
        description: string | null;
      }
    | null
    | undefined {
    return this.props.product;
  }

  get recipeId(): string | null | undefined {
    return this.props.recipeId;
  }

  get recipeName(): string | null | undefined {
    return this.props.recipeName;
  }

  get quantity(): number {
    return this.props.quantity.value;
  }

  get unit(): string {
    return this.props.unit.value;
  }

  get isCompleted(): boolean {
    return this.props.status.isCompleted;
  }

  get selectedPriceId(): string | null | undefined {
    return this.props.selectedPriceId;
  }

  get selectedPrice():
    | {
        id: string;
        amount: number;
        currency: string;
        unit: string;
        store: {
          id: string;
          name: string;
          location: string;
        };
      }
    | null
    | undefined {
    return this.props.selectedPrice;
  }

  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  // Immutable update methods - return new instances
  public withQuantity(quantity: number): ShoppingListItem {
    return new ShoppingListItem(
      {
        ...this.props,
        quantity: ItemQuantity.create(quantity),
        updatedAt: new Date()
      },
      this._id
    );
  }

  public withUnit(unit: string): ShoppingListItem {
    return new ShoppingListItem(
      {
        ...this.props,
        unit: Unit.create(unit),
        updatedAt: new Date()
      },
      this._id
    );
  }

  public withNotes(notes: string | null): ShoppingListItem {
    return new ShoppingListItem(
      {
        ...this.props,
        notes,
        updatedAt: new Date()
      },
      this._id
    );
  }

  public withToggleCompletion(): ShoppingListItem {
    return new ShoppingListItem(
      {
        ...this.props,
        status: this.props.status.toggle(),
        updatedAt: new Date()
      },
      this._id
    );
  }

  public withCompletion(): ShoppingListItem {
    return new ShoppingListItem(
      {
        ...this.props,
        status: this.props.status.complete(),
        updatedAt: new Date()
      },
      this._id
    );
  }

  public withReset(): ShoppingListItem {
    return new ShoppingListItem(
      {
        ...this.props,
        status: this.props.status.reset(),
        updatedAt: new Date()
      },
      this._id
    );
  }

  public withRecipe(recipeId: string | null, recipeName: string | null): ShoppingListItem {
    return new ShoppingListItem(
      {
        ...this.props,
        recipeId,
        recipeName,
        updatedAt: new Date()
      },
      this._id
    );
  }

  public withSelectedPrice(selectedPriceId: string | null): ShoppingListItem {
    return new ShoppingListItem(
      {
        ...this.props,
        selectedPriceId,
        updatedAt: new Date()
      },
      this._id
    );
  }

  public toObject(): ShoppingListItemPayload {
    return {
      id: this.id,
      shoppingListId: this.shoppingListId,
      productId: this.productId,
      recipeId: this.recipeId,
      recipeName: this.recipeName,
      quantity: this.quantity,
      // @ts-ignore
      unit: this.unit,
      isCompleted: this.isCompleted,
      selectedPriceId: this.selectedPriceId,
      notes: this.notes,
      product: this.product,
      selectedPrice: this.selectedPrice,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
