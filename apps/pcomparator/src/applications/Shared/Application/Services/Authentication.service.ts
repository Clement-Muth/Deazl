import type { Session } from "next-auth";
import { auth } from "~/libraries/nextauth/authConfig";

// NOTE – Move this service in the Shared bounded context
export class AuthenticationService {
  /**
   * Get the current authenticated user
   * This method retrieves the current user from the session.
   * If the user is not authenticated, it throws an error.
   * @throws {Error} If the user is not authenticated
   *
   * @returns {Promise<{ id: string }>} The current user
   */
  async getCurrentUser(): Promise<Session["user"]> {
    const session = await auth();

    if (!session?.user?.id) throw new Error("User not authenticated");

    return session.user;
  }

  /**
   *
   * @returns {Promise<boolean>} True if the user is authenticated, false otherwise
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();

      return true;
    } catch {
      return false;
    }
  }
}
