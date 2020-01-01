import StandardLibraryObject, {
  StandardLibraryFunction,
} from './internal-objects/standard-library-object';
import {
  createError,
  InternalString,
  InternalInteger,
} from './internal-objects';
import assertNonNullable from '../utils/assert-non-nullable';

const len: StandardLibraryFunction = function stdlib__len(...args) {
  if (args.length !== 1) {
    return createError(
      `Wrong number of arguments. Expected 1, got ${args.length}`
    );
  }
  const head = args[0];
  assertNonNullable(head);
  if (head instanceof InternalString) {
    return new InternalInteger(head.value.length);
  }
  return createError(`TypeError: \`len\` expects a string, got ${head.type}`);
};

export default {
  len: new StandardLibraryObject(len),
};
