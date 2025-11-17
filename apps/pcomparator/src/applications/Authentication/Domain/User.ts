export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly fullname: string,
    public readonly avatar: string
  ) {
    Object.freeze(this);
  }
}
