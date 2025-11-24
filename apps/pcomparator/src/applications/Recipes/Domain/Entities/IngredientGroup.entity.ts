import { Entity } from "~/applications/Shared/Domain/Core/Entity";
import { UniqueEntityID } from "~/applications/Shared/Domain/Core/UniqueEntityId";
import type { RecipeIngredient } from "./RecipeIngredient.entity";

interface IngredientGroupProps {
  recipeId: string;
  name: string;
  order: number;
  ingredients?: RecipeIngredient[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class IngredientGroup extends Entity<IngredientGroupProps> {
  private constructor(props: IngredientGroupProps, id?: string) {
    super(props, new UniqueEntityID(id));
  }

  public static create(
    props: {
      recipeId: string;
      name: string;
      order?: number;
      ingredients?: RecipeIngredient[];
    },
    id?: string
  ): IngredientGroup {
    return new IngredientGroup(
      {
        recipeId: props.recipeId,
        name: props.name,
        order: props.order ?? 0,
        ingredients: props.ingredients || [],
        createdAt: new Date(),
        updatedAt: new Date()
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

  get name(): string {
    return this.props.name;
  }

  get order(): number {
    return this.props.order;
  }

  get ingredients(): RecipeIngredient[] {
    return this.props.ingredients || [];
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public withName(name: string): IngredientGroup {
    return new IngredientGroup(
      {
        ...this.props,
        name,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withOrder(order: number): IngredientGroup {
    return new IngredientGroup(
      {
        ...this.props,
        order,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withIngredients(ingredients: RecipeIngredient[]): IngredientGroup {
    return new IngredientGroup(
      {
        ...this.props,
        ingredients,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public toObject() {
    return {
      id: this.id,
      recipeId: this.recipeId,
      name: this.name,
      order: this.order,
      ingredients: this.ingredients.map((ing) => ing.toObject()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
