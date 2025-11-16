import { Entity, UniqueEntityID } from "@deazl/shared";
import type { PantryItemPayload } from "../Schemas/PantryItem.schema";
import { Location } from "../ValueObjects/Location.valueobject";
import { Unit } from "../ValueObjects/Unit.valueobject";

interface PantryItemProps {
  userId: string;
  productId?: string;
  name: string;
  quantity: number;
  unit: Unit;
  expiration?: Date;
  location: Location;
  createdAt: Date;
  updatedAt: Date;
}

export class PantryItem extends Entity<PantryItemProps> {
  private constructor(props: PantryItemProps, id?: string) {
    super(props, new UniqueEntityID(id));
  }

  public static create(
    props: {
      userId: string;
      productId?: string;
      name: string;
      quantity: number;
      unit: string;
      expiration?: Date;
      location?: string;
    },
    id?: string
  ): PantryItem {
    return new PantryItem(
      {
        userId: props.userId,
        productId: props.productId,
        name: props.name,
        quantity: props.quantity,
        unit: Unit.create(props.unit),
        expiration: props.expiration,
        location: Location.create(props.location),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      id
    );
  }

  get id(): string {
    return this._id.toString();
  }

  get userId(): string {
    return this.props.userId;
  }

  get productId(): string | undefined {
    return this.props.productId;
  }

  get name(): string {
    return this.props.name;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unit(): Unit {
    return this.props.unit;
  }

  get expiration(): Date | undefined {
    return this.props.expiration;
  }

  get location(): Location {
    return this.props.location;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public withName(name: string): PantryItem {
    return new PantryItem(
      {
        ...this.props,
        name,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withQuantity(quantity: number): PantryItem {
    return new PantryItem(
      {
        ...this.props,
        quantity,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withUnit(unit: string): PantryItem {
    return new PantryItem(
      {
        ...this.props,
        unit: Unit.create(unit),
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withExpiration(expiration?: Date): PantryItem {
    return new PantryItem(
      {
        ...this.props,
        expiration,
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withLocation(location: string): PantryItem {
    return new PantryItem(
      {
        ...this.props,
        location: Location.create(location),
        updatedAt: new Date()
      },
      this._id.toValue()
    );
  }

  public withUpdates(updates: {
    name?: string;
    quantity?: number;
    unit?: string;
    expiration?: Date | null;
    location?: string;
  }): PantryItem {
    let updated: PantryItem = this;

    if (updates.name !== undefined) {
      updated = updated.withName(updates.name);
    }

    if (updates.quantity !== undefined) {
      updated = updated.withQuantity(updates.quantity);
    }

    if (updates.unit !== undefined) {
      updated = updated.withUnit(updates.unit);
    }

    if (updates.expiration !== undefined) {
      updated = updated.withExpiration(updates.expiration || undefined);
    }

    if (updates.location !== undefined) {
      updated = updated.withLocation(updates.location);
    }

    return updated;
  }

  public getDaysUntilExpiration(): number | null {
    if (!this.expiration) return null;

    const now = new Date();
    const expDate = new Date(this.expiration);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  public getExpirationStatus(): "expired" | "expiring-soon" | "fresh" | "none" {
    const days = this.getDaysUntilExpiration();

    if (days === null) return "none";
    if (days < 0) return "expired";
    if (days <= 3) return "expiring-soon";
    if (days <= 7) return "expiring-soon";
    return "fresh";
  }

  public isExpired(): boolean {
    return this.getExpirationStatus() === "expired";
  }

  public isExpiringSoon(): boolean {
    return this.getExpirationStatus() === "expiring-soon";
  }

  public canBeConsumed(): boolean {
    return !this.isExpired() && this.quantity > 0;
  }

  public toObject(): PantryItemPayload {
    return {
      id: this.id,
      userId: this.userId,
      productId: this.productId || null,
      name: this.name,
      quantity: this.quantity,
      unit: this.unit.toString(),
      expiration: this.expiration || null,
      location: this.location.toString(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expirationStatus: this.getExpirationStatus(),
      daysUntilExpiration: this.getDaysUntilExpiration()
    };
  }
}
