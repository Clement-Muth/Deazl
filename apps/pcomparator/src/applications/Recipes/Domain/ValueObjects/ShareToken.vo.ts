import { randomBytes } from "node:crypto";
import { ValueObject } from "~/applications/Shared/Domain/Core/ValueObject";

interface ShareTokenProps {
  value: string;
}

export class ShareToken extends ValueObject<ShareTokenProps> {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_REGEX = /^[a-zA-Z0-9_-]{32,64}$/;

  private constructor(props: ShareTokenProps) {
    super(props);
  }

  public static create(value?: string): ShareToken {
    if (value) {
      if (!ShareToken.isValid(value)) {
        throw new Error("Invalid share token format");
      }
      return new ShareToken({ value });
    }

    return ShareToken.generate();
  }

  public static generate(): ShareToken {
    const buffer = randomBytes(ShareToken.TOKEN_LENGTH);
    const token = buffer.toString("base64url");
    return new ShareToken({ value: token });
  }

  public static isValid(token: string): boolean {
    return ShareToken.TOKEN_REGEX.test(token);
  }

  get value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }

  public equals(other: ShareToken): boolean {
    return this.props.value === other.props.value;
  }
}
