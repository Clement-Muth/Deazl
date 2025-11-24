import { Entity } from "~/applications/Shared/Domain/Core/Entity";
import { UniqueEntityID } from "~/applications/Shared/Domain/Core/UniqueEntityId";

interface RecipeStepProps {
  recipeId: string;
  stepNumber: number;
  description: string;
  duration?: number;
  groupId?: string;
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
      groupId?: string;
    },
    id?: string
  ): RecipeStep {
    return new RecipeStep(
      {
        recipeId: props.recipeId,
        stepNumber: props.stepNumber,
        description: props.description,
        duration: props.duration,
        groupId: props.groupId
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

  get groupId(): string | undefined {
    return this.props.groupId;
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

  public withGroup(groupId: string | undefined): RecipeStep {
    return new RecipeStep(
      {
        ...this.props,
        groupId
      },
      this._id.toValue()
    );
  }

  public toObject() {
    return {
      id: this.id,
      stepNumber: this.stepNumber,
      description: this.description,
      duration: this.duration ?? null,
      groupId: this.groupId
    };
  }
}
