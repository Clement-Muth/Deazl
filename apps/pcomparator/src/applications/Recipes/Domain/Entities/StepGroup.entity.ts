import { Entity } from "~/applications/Shared/Domain/Core/Entity";
import { UniqueEntityID } from "~/applications/Shared/Domain/Core/UniqueEntityId";
import type { RecipeStep } from "./RecipeStep.entity";

interface StepGroupProps {
  recipeId: string;
  name: string;
  order: number;
  steps?: RecipeStep[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class StepGroup extends Entity<StepGroupProps> {
  private constructor(props: StepGroupProps, id?: string) {
    super(props, new UniqueEntityID(id));
  }

  public static create(
    props: {
      recipeId: string;
      name: string;
      order?: number;
      steps?: RecipeStep[];
    },
    id?: string
  ): StepGroup {
    return new StepGroup(
      {
        recipeId: props.recipeId,
        name: props.name,
        order: props.order ?? 0,
        steps: props.steps || [],
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

  get steps(): RecipeStep[] {
    return this.props.steps || [];
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public withName(name: string): StepGroup {
    return new StepGroup(
      {
        ...this.props,
        name,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withOrder(order: number): StepGroup {
    return new StepGroup(
      {
        ...this.props,
        order,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withSteps(steps: RecipeStep[]): StepGroup {
    return new StepGroup(
      {
        ...this.props,
        steps,
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
      steps: this.steps.map((step) => step.toObject()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
