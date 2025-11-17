import { ValueObject } from "~/applications/Shared/Domain/Core/ValueObject";

interface ItemQuantityProps {
  value: number;
}

export class ItemQuantity extends ValueObject<ItemQuantityProps> {
  public static readonly MIN_VALUE = 0.01;

  private constructor(props: ItemQuantityProps) {
    super(props);
  }

  public static create(quantity: number): ItemQuantity {
    if (quantity < ItemQuantity.MIN_VALUE)
      throw new Error(`Quantity must be at least ${ItemQuantity.MIN_VALUE}`);

    return new ItemQuantity({ value: quantity });
  }

  public get value(): number {
    return this.props.value;
  }

  public increase(amount: number): ItemQuantity {
    return ItemQuantity.create(this.value + amount);
  }

  public decrease(amount: number): ItemQuantity {
    return ItemQuantity.create(Math.max(ItemQuantity.MIN_VALUE, this.value - amount));
  }
}
