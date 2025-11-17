import { DomainError } from "~/applications/Shared/Domain/Core/DomainError";

export class UserNotAuthenticated extends DomainError {
  constructor() {
    super("User not authenticated");
  }
}
