import { InternalObject, InternalObjectType } from '.';

export default class InternalString implements InternalObject {
  constructor(public value: string) {}

  get type() {
    return InternalObjectType.STRING_OBJ;
  }

  inspect() {
    return this.value.toString();
  }
}