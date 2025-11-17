export class HTTPError {
  public message: string;
  public name: string;
  public status: number;
  public cause: string;

  constructor(message: string, status: number, cause: string) {
    this.message = message;
    this.name = "HTTPError";
    this.status = status;
    this.cause = cause;
  }
}
