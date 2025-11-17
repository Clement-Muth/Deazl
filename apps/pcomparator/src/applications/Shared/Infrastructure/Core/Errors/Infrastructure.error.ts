export class InfrastructureError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(`Infrastructure error: ${message}`);
    this.name = "InfrastructureError";
    this.cause = cause;
  }
}

export class ResourceNotFoundError extends InfrastructureError {
  constructor(resourceType: string, id: string, cause?: unknown) {
    super(`${resourceType} with id ${id} not found`, cause);
    this.name = "ResourceNotFoundError";
  }
}

export class ValidationError extends InfrastructureError {
  constructor(
    message: string,
    public readonly errors?: any[],
    cause?: unknown
  ) {
    super(`Validation failed: ${message}`, cause);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export class AuthorizationError extends InfrastructureError {
  constructor(message: string, cause?: unknown) {
    super(`Authorization failed: ${message}`, cause);
    this.name = "AuthorizationError";
  }
}

export class ServerError extends InfrastructureError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    cause?: unknown
  ) {
    super(`Server error: ${message}`, cause);
    this.name = "ServerError";
    this.statusCode = statusCode;
  }
}

export class NetworkError extends InfrastructureError {
  constructor(message: string, cause?: unknown) {
    super(`Network error: ${message}`, cause);
    this.name = "NetworkError";
  }
}
