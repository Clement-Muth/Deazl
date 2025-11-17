export class Barcode {
  constructor(
    public readonly barcode: string,
    public readonly format?: string
  ) {
    Object.freeze(this);
  }
}
