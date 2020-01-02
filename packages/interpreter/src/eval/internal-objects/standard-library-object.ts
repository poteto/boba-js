import { InternalObject, InternalObjectType } from '.';
import { Maybe } from '../../utils/maybe';

export type StandardLibraryFunction = (
  ...args: Maybe<InternalObject>[]
) => Maybe<InternalObject>;

export default class StandardLibraryObject implements InternalObject {
  constructor(public fn: StandardLibraryFunction) {}

  get type() {
    return InternalObjectType.STDLIB_OBJ;
  }

  inspect() {
    return `stdlib: ${this.fn}`;
  }
}
