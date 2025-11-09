import { RecipeRole } from "../Entities/RecipeCollaborator.entity";

export class RecipeRoleValidator {
  private static readonly validRoles = Object.values(RecipeRole);

  public static isValid(role: string): boolean {
    return this.validRoles.includes(role as RecipeRole);
  }

  public static validate(role: string): RecipeRole {
    if (!this.isValid(role)) {
      throw new Error(`Invalid recipe role: ${role}`);
    }
    return role as RecipeRole;
  }

  public static getValidRoles(): RecipeRole[] {
    return [...this.validRoles];
  }
}
