import { InternalObject, InternalObjectType } from '.';
import { Maybe } from '../../utils/maybe';

export type ArgumentError = [InternalError];

export function isArgumentError(
  args: ArgumentError | Maybe<InternalObject>[]
): args is ArgumentError {
  return args.length === 1 && isError(args[0]);
}

function isError(obj: Maybe<InternalObject>): obj is InternalError {
  return obj !== null ? obj.type === InternalObjectType.ERROR_OBJ : false;
}

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
