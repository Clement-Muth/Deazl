import { v4 } from "uuid";
import { Identifier } from "~/Shared/Domain/Core/Identifier";

export class UniqueEntityID extends Identifier<string> {
  constructor(id?: string) {
    super(id ? id : v4());
  }
}
