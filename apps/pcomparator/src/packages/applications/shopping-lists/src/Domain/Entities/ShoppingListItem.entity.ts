import { DomainError, Entity, UniqueEntityID } from "@deazl/shared";
import { z } from "zod";
import { BusinessRuleViolationError } from "../../Domain/Errors/ShoppingListItemEntity.error";
import type { ShoppingListItemSchema } from "../../Domain/Schemas/ShoppingListItem.schema";
import { ItemQuantity } from "../../Domain/ValueObjects/ItemQuantity.vo";
import { ItemStatus } from "../../Domain/ValueObjects/ItemStatus.vo";
import { Price } from "../../Domain/ValueObjects/Price.vo";
import { Unit } from "../../Domain/ValueObjects/Unit.vo";

export class ItemNameTooShortError extends DomainError {
  constructor() {
    super("Item name must be at least 2 characters long");
  }
}

export type ShoppingListItemPayload = z.infer<typeof ShoppingListItemSchema>;

export interface ShoppingListItemProps {
  shoppingListId: string;
  productId?: string | null;
  recipeId?: string | null; // ID de la recette source
  recipeName?: string | null; // Cache du nom de la recette pour affichage
  quantity: ItemQuantity;
  unit: Unit;
  status: ItemStatus;
  customName?: string;
  totalPrice?: Price | null; // Total price for the item quantity
  barcode?: string | null; // Code-barres pour enrichissement OpenFoodFacts
  notes?: string | null;
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
      productId?: string | null;
      recipeId?: string | null;
      recipeName?: string | null;
      quantity: number;
      unit: string;
      isCompleted?: boolean;
      customName?: string;
      price?: number | null; // Total price for item quantity
      barcode?: string | null; // Code-barres pour enrichissement OpenFoodFacts
      notes?: string | null;
    },
    id?: string
  ): ShoppingListItem {
    if (props.customName && props.customName.length < 2) {
      throw new ItemNameTooShortError();
    }

    const itemEntity = new ShoppingListItem(
      {
        shoppingListId: props.shoppingListId,
        productId: props.productId,
        recipeId: props.recipeId,
        recipeName: props.recipeName,
        quantity: ItemQuantity.create(props.quantity),
        unit: Unit.create(props.unit),
        status: ItemStatus.create(props.isCompleted || false),
        customName: props.customName,
        totalPrice: props.price !== undefined ? Price.create(props.price) : undefined,
        barcode: props.barcode,
        notes: props.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      id ? new UniqueEntityID(id) : undefined
    );

    return itemEntity;
  }

  public withUpdates(
    updates: Partial<
      Pick<ShoppingListItemPayload, "customName" | "quantity" | "unit" | "price" | "isCompleted" | "barcode">
    >,
    shoppingListItemId: string
  ): ShoppingListItem {
    try {
      // Check if user has editor or owner role to update the item

      return ShoppingListItem.create(
        {
          shoppingListId: this.shoppingListId,
          productId: this.productId,
          quantity: updates.quantity ?? this.quantity,
          unit: updates.unit ?? this.unit,
          isCompleted: updates.isCompleted ?? this.isCompleted,
          customName: updates.customName ?? this.customName,
          price: updates.price ?? this.price,
          barcode: updates.barcode ?? this.barcode
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

  get productId(): string | null | undefined {
    return this.props.productId;
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

  get customName(): string | undefined {
    return this.props.customName;
  }

  get price(): number | null | undefined {
    return this.props.totalPrice?.value;
  }

  get barcode(): string | null | undefined {
    return this.props.barcode;
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

  // Calculate the unit price based on total price and quantity
  public getUnitPrice(): Price | null {
    const totalPrice = this.props.totalPrice;
    if (!totalPrice || totalPrice.value === null || !this.props.quantity) {
      return null;
    }
    return Price.create(totalPrice.value / this.props.quantity.value);
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

  public withName(name: string): ShoppingListItem {
    if (name && name.length < 2) {
      throw new ItemNameTooShortError();
    }
    return new ShoppingListItem(
      {
        ...this.props,
        customName: name,
        updatedAt: new Date()
      },
      this._id
    );
  }

  public withPrice(price: number | null): ShoppingListItem {
    return new ShoppingListItem(
      {
        ...this.props,
        totalPrice: Price.create(price),
        updatedAt: new Date()
      },
      this._id
    );
  }

  public withBarcode(barcode: string | null): ShoppingListItem {
    return new ShoppingListItem(
      {
        ...this.props,
        barcode,
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
      customName: this.customName,
      // @ts-ignore
      price: this.price,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
