/**
 * Query object pour encapsuler la logique de recherche des listes de courses
 * Respecte le principe de séparation des responsabilités en gardant
 * la logique de requête dans le Domain plutôt que dans l'Infrastructure
 */
export class ShoppingListQuery {
  private filters: {
    userId?: string;
    collaboratorUserId?: string;
    isShared?: boolean;
    name?: string;
  } = {};

  private ordering: {
    field: string;
    direction: "asc" | "desc";
  } = { field: "updatedAt", direction: "desc" };

  private pagination?: {
    limit: number;
    offset: number;
  };

  /**
   * Filtre les listes appartenant à un utilisateur spécifique
   */
  forUser(userId: string): ShoppingListQuery {
    this.filters.userId = userId;
    return this;
  }

  /**
   * Filtre les listes où l'utilisateur est collaborateur
   */
  whereUserIsCollaborator(userId: string): ShoppingListQuery {
    this.filters.collaboratorUserId = userId;
    return this;
  }

  /**
   * Filtre uniquement les listes partagées
   */
  onlySharedLists(): ShoppingListQuery {
    this.filters.isShared = true;
    return this;
  }

  /**
   * Filtre par nom de liste (recherche partielle)
   */
  withNameContaining(name: string): ShoppingListQuery {
    this.filters.name = name;
    return this;
  }

  /**
   * Trie par date de modification (plus récent en premier)
   */
  orderByMostRecent(): ShoppingListQuery {
    this.ordering = { field: "updatedAt", direction: "desc" };
    return this;
  }

  /**
   * Trie par nom alphabétique
   */
  orderByName(): ShoppingListQuery {
    this.ordering = { field: "name", direction: "asc" };
    return this;
  }

  /**
   * Trie par date de création
   */
  orderByCreationDate(): ShoppingListQuery {
    this.ordering = { field: "createdAt", direction: "desc" };
    return this;
  }

  /**
   * Ajoute une pagination
   */
  withPagination(limit: number, offset = 0): ShoppingListQuery {
    this.pagination = { limit, offset };
    return this;
  }

  // Getters pour que l'Infrastructure puisse construire les requêtes
  get userId() {
    return this.filters.userId;
  }
  get collaboratorUserId() {
    return this.filters.collaboratorUserId;
  }
  get isShared() {
    return this.filters.isShared;
  }
  get name() {
    return this.filters.name;
  }
  get orderBy() {
    return { [this.ordering.field]: this.ordering.direction };
  }
  get limit() {
    return this.pagination?.limit;
  }
  get offset() {
    return this.pagination?.offset;
  }

  /**
   * Combine les filtres pour les listes accessibles par un utilisateur
   * (propriétaire OU collaborateur)
   */
  static forUserAccess(userId: string): ShoppingListQuery {
    const query = new ShoppingListQuery();
    query.filters.userId = userId;
    query.filters.collaboratorUserId = userId;
    return query;
  }
}
