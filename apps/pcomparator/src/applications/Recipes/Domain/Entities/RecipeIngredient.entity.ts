import { Entity, UniqueEntityID } from "@deazl/shared";

interface RecipeIngredientProps {
  recipeId: string;
  productId: string;
  productName?: string; // Cached for display
  quantity: number;
  unit: string;
  order: number;
}

export class RecipeIngredient extends Entity<RecipeIngredientProps> {
  private constructor(props: RecipeIngredientProps, id?: string) {
    super(props, new UniqueEntityID(id));
  }

  public static create(
    props: {
      recipeId: string;
      productId: string;
      productName?: string;
      quantity: number;
      unit: string;
      order?: number;
    },
    id?: string
  ): RecipeIngredient {
    return new RecipeIngredient(
      {
        recipeId: props.recipeId,
        productId: props.productId,
        productName: props.productName,
        quantity: props.quantity,
        unit: props.unit,
        order: props.order ?? 0
      },
      id
    );
  }

  get id(): string {
    return this._id.toString();
  }

  get recipeId(): string {
    return this.props.recipeId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string | undefined {
    return this.props.productName;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unit(): string {
    return this.props.unit;
  }

  get order(): number {
    return this.props.order;
  }

  public withQuantity(quantity: number): RecipeIngredient {
    return new RecipeIngredient(
      {
        ...this.props,
        quantity
      },
      this._id.toValue()
    );
  }

  public withUnit(unit: string): RecipeIngredient {
    return new RecipeIngredient(
      {
        ...this.props,
        unit
      },
      this._id.toValue()
    );
  }

  public withOrder(order: number): RecipeIngredient {
    return new RecipeIngredient(
      {
        ...this.props,
        order
      },
      this._id.toValue()
    );
  }

  public toObject() {
    return {
      id: this.id,
      productId: this.productId,
      productName: this.productName,
      quantity: this.quantity,
      unit: this.unit,
      order: this.order
    };
  }
}
