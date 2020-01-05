import { HashableInternalObject, InternalObjectType } from '.';

export default class InternalBoolean implements HashableInternalObject {
  constructor(public value: boolean) {}

  get type() {
    return InternalObjectType.BOOLEAN_OBJ;
  }

  inspect() {
    return this.value.toString();
  }

  toHashKey() {
    const value = this.value ? 1 : 0 ;
    return `${this.type}@${value}`;
  }
}

export const INTERNAL_TRUE = new InternalBoolean(true);
export const INTERNAL_FALSE = new InternalBoolean(false);
