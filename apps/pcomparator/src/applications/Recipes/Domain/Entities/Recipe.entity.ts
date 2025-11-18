import { Entity } from "~/applications/Shared/Domain/Core/Entity";
import { UniqueEntityID } from "~/applications/Shared/Domain/Core/UniqueEntityId";
import type { DifficultyLevel } from "../Schemas/Recipe.schema";
import type { RecipePayload } from "../Schemas/Recipe.schema";
import { RecipeVisibility, RecipeVisibilityStatus } from "../ValueObjects/RecipeVisibility.vo";
import { ShareToken } from "../ValueObjects/ShareToken.vo";
import type { RecipeCollaborator } from "./RecipeCollaborator.entity";
import type { RecipeIngredient } from "./RecipeIngredient.entity";
import type { RecipeStep } from "./RecipeStep.entity";

interface RecipeProps {
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  preparationTime: number;
  cookingTime: number;
  servings: number;
  imageUrl?: string;
  userId: string;
  isPublic: boolean;
  shareToken?: string;
  category?: string;
  cuisine?: string;
  tags?: string[];
  viewsCount?: number;
  favoritesCount?: number;
  collaborators?: RecipeCollaborator[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  createdAt?: Date;
  updatedAt?: Date;
  estimatedQualityScore?: number;
}

export class Recipe extends Entity<RecipeProps> {
  private constructor(props: RecipeProps, id?: string) {
    super(props, new UniqueEntityID(id));
  }

  public static create(
    props: {
      name: string;
      description?: string;
      difficulty: DifficultyLevel;
      preparationTime: number;
      cookingTime: number;
      servings?: number;
      imageUrl?: string;
      userId: string;
      isPublic?: boolean;
      shareToken?: string;
      category?: string;
      cuisine?: string;
      tags?: string[];
      viewsCount?: number;
      favoritesCount?: number;
      collaborators?: RecipeCollaborator[];
      ingredients?: RecipeIngredient[];
      steps?: RecipeStep[];
      estimatedQualityScore?: number;
    },
    id?: string
  ): Recipe {
    return new Recipe(
      {
        name: props.name,
        description: props.description,
        difficulty: props.difficulty,
        preparationTime: props.preparationTime,
        cookingTime: props.cookingTime,
        servings: props.servings ?? 4,
        imageUrl: props.imageUrl,
        userId: props.userId,
        isPublic: props.isPublic ?? false,
        shareToken: props.shareToken,
        category: props.category,
        cuisine: props.cuisine,
        tags: props.tags || [],
        viewsCount: props.viewsCount ?? 0,
        favoritesCount: props.favoritesCount ?? 0,
        collaborators: props.collaborators || [],
        ingredients: props.ingredients || [],
        steps: props.steps || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedQualityScore: props.estimatedQualityScore
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

  get difficulty(): DifficultyLevel {
    return this.props.difficulty;
  }

  get preparationTime(): number {
    return this.props.preparationTime;
  }

  get cookingTime(): number {
    return this.props.cookingTime;
  }

  get servings(): number {
    return this.props.servings;
  }

  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  get userId(): string {
    return this.props.userId;
  }

  get isPublic(): boolean {
    return this.props.isPublic;
  }

  get shareToken(): string | undefined {
    return this.props.shareToken;
  }

  get collaborators(): RecipeCollaborator[] {
    return this.props.collaborators || [];
  }

  get ingredients(): RecipeIngredient[] {
    return this.props.ingredients;
  }

  get steps(): RecipeStep[] {
    return this.props.steps;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get totalTime(): number {
    return this.props.preparationTime + this.props.cookingTime;
  }

  public withName(name: string): Recipe {
    return new Recipe(
      {
        ...this.props,
        name,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withDescription(description: string): Recipe {
    return new Recipe(
      {
        ...this.props,
        description,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withDifficulty(difficulty: DifficultyLevel): Recipe {
    return new Recipe(
      {
        ...this.props,
        difficulty,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withPreparationTime(preparationTime: number): Recipe {
    return new Recipe(
      {
        ...this.props,
        preparationTime,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withCookingTime(cookingTime: number): Recipe {
    return new Recipe(
      {
        ...this.props,
        cookingTime,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withServings(servings: number): Recipe {
    return new Recipe(
      {
        ...this.props,
        servings,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withImageUrl(imageUrl: string): Recipe {
    return new Recipe(
      {
        ...this.props,
        imageUrl,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withIsPublic(isPublic: boolean): Recipe {
    return new Recipe(
      {
        ...this.props,
        isPublic,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withCategory(category?: string): Recipe {
    return new Recipe(
      {
        ...this.props,
        category,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withCuisine(cuisine?: string): Recipe {
    return new Recipe(
      {
        ...this.props,
        cuisine,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withIngredients(ingredients: RecipeIngredient[]): Recipe {
    return new Recipe(
      {
        ...this.props,
        ingredients,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withSteps(steps: RecipeStep[]): Recipe {
    return new Recipe(
      {
        ...this.props,
        steps,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withUpdates(updates: Partial<RecipeProps>): Recipe {
    let updatedRecipe: Recipe = this;

    if (updates.name !== undefined) {
      updatedRecipe = updatedRecipe.withName(updates.name);
    }

    if (updates.description !== undefined) {
      updatedRecipe = updatedRecipe.withDescription(updates.description);
    }

    if (updates.difficulty !== undefined) {
      updatedRecipe = updatedRecipe.withDifficulty(updates.difficulty);
    }

    if (updates.preparationTime !== undefined) {
      updatedRecipe = updatedRecipe.withPreparationTime(updates.preparationTime);
    }

    if (updates.cookingTime !== undefined) {
      updatedRecipe = updatedRecipe.withCookingTime(updates.cookingTime);
    }

    if (updates.servings !== undefined) {
      updatedRecipe = updatedRecipe.withServings(updates.servings);
    }

    if (updates.imageUrl !== undefined) {
      updatedRecipe = updatedRecipe.withImageUrl(updates.imageUrl);
    }

    if (updates.isPublic !== undefined) {
      updatedRecipe = updatedRecipe.withIsPublic(updates.isPublic);
    }

    if (updates.category !== undefined) {
      updatedRecipe = updatedRecipe.withCategory(updates.category);
    }

    if (updates.cuisine !== undefined) {
      updatedRecipe = updatedRecipe.withCuisine(updates.cuisine);
    }

    if (updates.ingredients !== undefined) {
      updatedRecipe = updatedRecipe.withIngredients(updates.ingredients);
    }

    if (updates.steps !== undefined) {
      updatedRecipe = updatedRecipe.withSteps(updates.steps);
    }

    return updatedRecipe;
  }

  public isOwner(userId: string): boolean {
    return this.userId === userId;
  }

  public canBeShared(): boolean {
    return this.name.length > 0;
  }

  public canUserModify(userId: string, userRole?: string): boolean {
    if (this.isOwner(userId)) return true;

    const collaborator = this.collaborators?.find((c) => c.userId === userId);
    if (!collaborator) return false;

    return collaborator.role === "OWNER" || collaborator.role === "EDITOR";
  }

  public canUserView(userId: string, userRole?: string): boolean {
    if (this.isPublic || this.isOwner(userId)) return true;

    return this.isUserCollaborator(userId);
  }

  public canUserShare(userId: string): boolean {
    return this.isOwner(userId);
  }

  public getVisibility(): RecipeVisibility {
    return RecipeVisibility.fromBooleans(this.isPublic, !!this.shareToken);
  }

  public canBeAccessedByAnonymous(): boolean {
    const visibility = this.getVisibility();
    return visibility.isPublic();
  }

  public canBeAccessedWithToken(token: string): boolean {
    if (!this.shareToken) return false;
    return this.shareToken === token;
  }

  public requiresAuthenticationToView(): boolean {
    const visibility = this.getVisibility();
    return visibility.isPrivate();
  }

  public isVisibleInPublicHub(): boolean {
    return this.isPublic;
  }

  public isVisibleInAuthenticatedHub(userId: string): boolean {
    return this.isPublic || this.isOwner(userId) || this.isUserCollaborator(userId);
  }

  public canBeIndexedBySEO(): boolean {
    return this.isPublic;
  }

  public generateShareToken(): Recipe {
    const token = ShareToken.generate();
    return new Recipe(
      {
        ...this.props,
        shareToken: token.value,
        isPublic: false,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public removeShareToken(): Recipe {
    return new Recipe(
      {
        ...this.props,
        shareToken: undefined,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withVisibility(visibility: RecipeVisibilityStatus): Recipe {
    let isPublic = false;
    let shareToken = this.shareToken;

    switch (visibility) {
      case RecipeVisibilityStatus.PUBLIC:
        isPublic = true;
        shareToken = undefined;
        break;
      case RecipeVisibilityStatus.PRIVATE:
        isPublic = false;
        shareToken = undefined;
        break;
      case RecipeVisibilityStatus.UNLISTED:
        isPublic = false;
        if (!shareToken) {
          shareToken = ShareToken.generate().value;
        }
        break;
    }

    return new Recipe(
      {
        ...this.props,
        isPublic,
        shareToken,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public getUserRole(userId: string): string | null {
    if (this.userId === userId) return "OWNER";

    const collaborator = this.collaborators?.find((c) => c.userId === userId);
    return collaborator?.role || null;
  }

  public isUserCollaborator(userId: string): boolean {
    if (this.userId === userId) return true;

    return this.collaborators?.some((collaborator) => collaborator.userId === userId) || false;
  }

  public toObject(): RecipePayload {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      difficulty: this.difficulty,
      preparationTime: this.preparationTime,
      cookingTime: this.cookingTime,
      servings: this.servings,
      imageUrl: this.imageUrl,
      userId: this.userId,
      isPublic: this.isPublic,
      category: this.props.category,
      cuisine: this.props.cuisine,
      tags: this.props.tags,
      viewsCount: this.props.viewsCount ?? 0,
      favoritesCount: this.props.favoritesCount ?? 0,
      ingredients: this.ingredients.map((ingredient) => ingredient.toObject()),
      steps: this.steps.map((step) => step.toObject()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      totalTime: this.totalTime,
      estimatedQualityScore: this.props.estimatedQualityScore
    };
  }
}
