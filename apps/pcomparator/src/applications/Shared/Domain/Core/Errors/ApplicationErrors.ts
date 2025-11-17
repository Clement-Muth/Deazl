import { DomainError } from "../DomainError";

export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationError";
  }
}

export class InfrastructureError extends ApplicationError {
  constructor(message: string) {
    super(`Infrastructure error: ${message}`);
    this.name = "InfrastructureError";
  }
}

export class DataAccessError extends ApplicationError {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    console.error("DataAccessError:", message, originalError);
    super(`Data access error: ${message}`);
    this.name = "DataAccessError";
  }
}

export class ResourceNotFoundError extends ApplicationError {
  constructor(resourceType: string, identifier?: string | number) {
    const identifierMessage = identifier !== undefined ? ` with id ${identifier}` : "";
    super(`${resourceType}${identifierMessage} not found`);
    this.name = "ResourceNotFoundError";
  }
}

export const mapDomainErrorToHttpResponse = (error: Error): { statusCode: number; message: string } => {
  if (error instanceof DomainError) return { statusCode: 400, message: error.message };

  if (error instanceof ResourceNotFoundError) return { statusCode: 404, message: error.message };

  if (error instanceof DataAccessError)
    return { statusCode: 503, message: "Service temporarily unavailable. Please try again later." };

  if (error instanceof InfrastructureError) return { statusCode: 500, message: "Internal server error" };

  if (error instanceof ApplicationError) return { statusCode: 400, message: error.message };

  console.error("Unhandled error:", error);
  return { statusCode: 500, message: "An unexpected error occurred" };
};
