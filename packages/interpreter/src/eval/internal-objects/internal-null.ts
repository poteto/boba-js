import { InternalObject, InternalObjectType } from '.';

export default class InternalNull implements InternalObject {
  get type() {
    return InternalObjectType.NULL_OBJ;
  }

  inspect() {
    return 'null';
  }
}

export const INTERNAL_NULL = new InternalNull();
