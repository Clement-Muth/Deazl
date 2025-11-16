export class PantryItemNotFoundError extends Error {
  constructor(id: string) {
    super(`Pantry item with id ${id} not found`);
    this.name = "PantryItemNotFoundError";
  }
}

export class PantryItemUnauthorizedError extends Error {
  constructor() {
    super("You are not authorized to perform this action");
    this.name = "PantryItemUnauthorizedError";
  }
}

export class PantryItemValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PantryItemValidationError";
  }
}
