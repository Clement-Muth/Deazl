import { ValueObject } from "~/applications/Shared/Domain/Core/ValueObject";

export enum RecipeVisibilityStatus {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  UNLISTED = "UNLISTED"
}

interface RecipeVisibilityProps {
  status: RecipeVisibilityStatus;
}

export class RecipeVisibility extends ValueObject<RecipeVisibilityProps> {
  private constructor(props: RecipeVisibilityProps) {
    super(props);
  }

  public static create(status: RecipeVisibilityStatus): RecipeVisibility {
    return new RecipeVisibility({ status });
  }

  public static fromBooleans(isPublic: boolean, hasShareToken: boolean): RecipeVisibility {
    if (isPublic) {
      return RecipeVisibility.create(RecipeVisibilityStatus.PUBLIC);
    }

    if (hasShareToken) {
      return RecipeVisibility.create(RecipeVisibilityStatus.UNLISTED);
    }

    return RecipeVisibility.create(RecipeVisibilityStatus.PRIVATE);
  }

  public static public(): RecipeVisibility {
    return RecipeVisibility.create(RecipeVisibilityStatus.PUBLIC);
  }

  public static private(): RecipeVisibility {
    return RecipeVisibility.create(RecipeVisibilityStatus.PRIVATE);
  }

  public static unlisted(): RecipeVisibility {
    return RecipeVisibility.create(RecipeVisibilityStatus.UNLISTED);
  }

  get status(): RecipeVisibilityStatus {
    return this.props.status;
  }

  public isPublic(): boolean {
    return this.props.status === RecipeVisibilityStatus.PUBLIC;
  }

  public isPrivate(): boolean {
    return this.props.status === RecipeVisibilityStatus.PRIVATE;
  }

  public isUnlisted(): boolean {
    return this.props.status === RecipeVisibilityStatus.UNLISTED;
  }

  public requiresAuthentication(): boolean {
    return this.isPrivate();
  }

  public isAccessibleByAnyone(): boolean {
    return this.isPublic() || this.isUnlisted();
  }

  public isIndexableForSEO(): boolean {
    return this.isPublic();
  }

  public isVisibleInHub(): boolean {
    return this.isPublic();
  }

  public toBooleanPair(): { isPublic: boolean; hasShareToken: boolean } {
    return {
      isPublic: this.isPublic(),
      hasShareToken: this.isUnlisted()
    };
  }

  public toString(): string {
    return this.props.status;
  }
}
