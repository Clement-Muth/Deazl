import { RecipeRole } from "../Entities/RecipeCollaborator.entity";

export class RecipeRoleValidator {
  private static readonly validRoles = Object.values(RecipeRole);

  public static isValid(role: string): boolean {
    return RecipeRoleValidator.validRoles.includes(role as RecipeRole);
  }

  public static validate(role: string): RecipeRole {
    if (!RecipeRoleValidator.isValid(role)) {
      throw new Error(`Invalid recipe role: ${role}`);
    }
    return role as RecipeRole;
  }

  public static getValidRoles(): RecipeRole[] {
    return [...RecipeRoleValidator.validRoles];
  }
}
