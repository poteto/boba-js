import { InternalObject, InternalObjectType, HashKey } from '.';

type HashPairMap = {
  [key in HashKey]: InternalObject;
};

export default class InternalHash implements InternalObject {
  constructor(public pairs: HashPairMap) {}

  get type() {
    return InternalObjectType.HASH_OBJ;
  }

  inspect() {
    const pairs = [];
    for (const [key, value] of Object.entries(this.pairs)) {
      pairs.push(`${key}: ${value.inspect()}`);
    }
    if (pairs.length > 0) {
      return `{ ${pairs.join(', ')} }`;
    }
    return '{}';
  }
}
