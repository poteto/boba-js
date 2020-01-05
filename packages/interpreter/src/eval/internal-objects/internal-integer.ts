import { HashableInternalObject, InternalObjectType } from '.';

export default class InternalInteger implements HashableInternalObject {
  constructor(public value: number) {}

  get type() {
    return InternalObjectType.INTEGER_OBJ;
  }

  inspect() {
    return this.value.toString();
  }

  toHashKey() {
    return `${this.type}@${this.value}`;
  }
}
