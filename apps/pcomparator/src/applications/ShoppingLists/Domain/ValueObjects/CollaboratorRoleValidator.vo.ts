import { DomainError } from "~/applications/Shared/Domain/Core/DomainError";

export class InvalidCollaboratorRoleError extends DomainError {
  constructor(role: string) {
    super(`Invalid collaborator role: ${role}. Must be one of: OWNER, EDITOR, VIEWER`);
  }
}

export class CollaboratorRoleValidator {
  private static readonly VALID_ROLES = ["OWNER", "EDITOR", "VIEWER"] as const;

  /**
   * Valide un rôle de collaborateur
   */
  public static isValid(role: string): boolean {
    return CollaboratorRoleValidator.VALID_ROLES.includes(role as any);
  }

  /**
   * Valide un rôle de collaborateur et lève une erreur si invalide
   */
  public static validate(role: string): void {
    if (!CollaboratorRoleValidator.isValid(role)) {
      throw new InvalidCollaboratorRoleError(role);
    }
  }

  /**
   * Retourne la liste des rôles valides
   */
  public static getValidRoles(): readonly string[] {
    return CollaboratorRoleValidator.VALID_ROLES;
  }
}
