import { InternalObject, InternalObjectType } from '.';

export default class InternalBoolean implements InternalObject {
  constructor(public value: boolean) {}

  get type() {
    return InternalObjectType.BOOLEAN_OBJ;
  }

  inspect() {
    return this.value.toString();
  }
}

export const INTERNAL_TRUE = new InternalBoolean(true);
export const INTERNAL_FALSE = new InternalBoolean(false);