import { HashableInternalObject, InternalObjectType } from '.';
import fnv from 'fnv-plus';

export default class InternalString implements HashableInternalObject {
  constructor(public value: string) {}

  get type() {
    return InternalObjectType.STRING_OBJ;
  }

  inspect() {
    return this.value.toString();
  }

  toHashKey() {
    return `${this.type}@${fnv.fast1a64(this.value)}`;
  }
}
