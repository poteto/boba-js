import { InternalObject, InternalObjectType } from '.';

export function createError(
  message: string,
  ...args: unknown[]
): InternalError {
  return new InternalError(`${message}${args.join(' ')}`);
}

export default class InternalError implements InternalObject {
  constructor(public message: string) {}

  get type() {
    return InternalObjectType.ERROR_OBJ;
  }

  inspect() {
    return `Error: ${this.message}`;
  }
}
