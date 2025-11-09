import { Entity, UniqueEntityID } from "@deazl/shared";

interface RecipeStepProps {
  recipeId: string;
  stepNumber: number;
  description: string;
  duration?: number;
}

export class RecipeStep extends Entity<RecipeStepProps> {
  private constructor(props: RecipeStepProps, id?: string) {
    super(props, new UniqueEntityID(id));
  }

  public static create(
    props: {
      recipeId: string;
      stepNumber: number;
      description: string;
      duration?: number;
    },
    id?: string
  ): RecipeStep {
    return new RecipeStep(
      {
        recipeId: props.recipeId,
        stepNumber: props.stepNumber,
        description: props.description,
        duration: props.duration
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

  get stepNumber(): number {
    return this.props.stepNumber;
  }

  get description(): string {
    return this.props.description;
  }

  get duration(): number | undefined {
    return this.props.duration;
  }

  public withDescription(description: string): RecipeStep {
    return new RecipeStep(
      {
        ...this.props,
        description
      },
      this._id.toValue()
    );
  }

  public withDuration(duration: number): RecipeStep {
    return new RecipeStep(
      {
        ...this.props,
        duration
      },
      this._id.toValue()
    );
  }

  public toObject() {
    return {
      id: this.id,
      stepNumber: this.stepNumber,
      description: this.description,
      duration: this.duration ?? null
    };
  }
}
