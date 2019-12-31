import { InternalObject } from '.';
import { Maybe } from '../../utils/maybe';
import hasOwnProperty from '../../utils/has-own-property';

type EnvironmentStoreKey = string | number;
type EnvironmentStore = {
  [key in EnvironmentStoreKey]: InternalObject;
};

export default class Environment {
  store: EnvironmentStore = Object.create(null);

  get(key: EnvironmentStoreKey): Maybe<InternalObject> {
    if (hasOwnProperty(this.store, key)) {
      return this.store[key];
    }
    return null;
  }

  set(key: EnvironmentStoreKey, value: Maybe<InternalObject>) {
    if (value !== null) {
      this.store[key] = value;
    }
    return value;
  }
}