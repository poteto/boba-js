import { InternalObject, InternalObjectType } from '.';
import { Maybe } from '../../utils/maybe';

export default class InternalArray implements InternalObject {
  constructor(public elements: Maybe<InternalObject>[]) {}

  get type() {
    return InternalObjectType.ARRAY_OBJ;
  }

  inspect() {
    const elements = this.elements
      .map(element => element?.inspect())
      .join(', ');
    return `[${elements}]`;
  }
}
