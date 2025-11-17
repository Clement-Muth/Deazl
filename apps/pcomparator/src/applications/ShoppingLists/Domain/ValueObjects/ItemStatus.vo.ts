import { ValueObject } from "~/applications/Shared/Domain/Core/ValueObject";

interface ItemStatusProps {
  isCompleted: boolean;
}

export class ItemStatus extends ValueObject<ItemStatusProps> {
  private constructor(props: ItemStatusProps) {
    super(props);
  }

  public static create(isCompleted: boolean): ItemStatus {
    return new ItemStatus({ isCompleted });
  }

  public static createPending(): ItemStatus {
    return new ItemStatus({ isCompleted: false });
  }

  public static createCompleted(): ItemStatus {
    return new ItemStatus({ isCompleted: true });
  }

  public get isCompleted(): boolean {
    return this.props.isCompleted;
  }

  public get isPending(): boolean {
    return !this.props.isCompleted;
  }

  public complete(): ItemStatus {
    return ItemStatus.createCompleted();
  }

  public reset(): ItemStatus {
    return ItemStatus.createPending();
  }

  public toggle(): ItemStatus {
    return ItemStatus.create(!this.props.isCompleted);
  }
}
