import { InternalObject, InternalObjectType } from '.';

export default class InternalReturnValue implements InternalObject {
  constructor(public value: InternalObject) {}

  get type() {
    return InternalObjectType.RETURN_VALUE_OBJ;
  }

  inspect() {
    return this.value.inspect();
  }
}