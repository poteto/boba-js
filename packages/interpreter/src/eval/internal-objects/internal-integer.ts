import { InternalObject, InternalObjectType } from '.';

export default class InternalInteger implements InternalObject {
  constructor(public value: number) {}

  get type() {
    return InternalObjectType.INTEGER_OBJ;
  }

  inspect() {
    return this.value.toString();
  }
}