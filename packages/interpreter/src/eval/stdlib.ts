import StandardLibraryObject, {
  StandardLibraryFunction,
} from './internal-objects/standard-library-object';
import {
  createError,
  InternalString,
  InternalInteger,
  InternalArray,
} from './internal-objects';
import assertNonNullable from '../utils/assert-non-nullable';
import { INTERNAL_NULL } from './internal-objects/internal-null';

const len: StandardLibraryFunction = function stdlib__len(...args) {
  if (args.length !== 1) {
    return createError(
      `Wrong number of arguments. Expected 1, got ${args.length}`
    );
  }
  const first = args[0];
  assertNonNullable(first);
  if (first instanceof InternalString) {
    return new InternalInteger(first.value.length);
  }
  if (first instanceof InternalArray) {
    return new InternalInteger(first.elements.length);
  }
  return createError(`TypeError: \`len\` expects a string, got ${first.type}`);
};

const head: StandardLibraryFunction = function stdlib__head(...args) {
  if (args.length !== 1) {
    return createError(
      `Wrong number of arguments. Expected 1, got ${args.length}`
    );
  }
  const first = args[0];
  assertNonNullable(first);
  if (first instanceof InternalArray && first.elements !== null) {
    if (first.elements.length > 0) {
      return first.elements[0];
    }
    return INTERNAL_NULL;
  }
  return createError(`TypeError: \`head\` expects an array, got ${first.type}`);
};

const tail: StandardLibraryFunction = function stdlib__tail(...args) {
  if (args.length !== 1) {
    return createError(
      `Wrong number of arguments. Expected 1, got ${args.length}`
    );
  }
  const first = args[0];
  assertNonNullable(first);
  if (first instanceof InternalArray && first.elements !== null) {
    if (first.elements.length > 0) {
      return new InternalArray(first.elements.slice(1, first.elements.length));
    }
    return INTERNAL_NULL;
  }
  return createError(`TypeError: \`tail\` expects an array, got ${first.type}`);
};

const last: StandardLibraryFunction = function stdlib__last(...args) {
  if (args.length !== 1) {
    return createError(
      `Wrong number of arguments. Expected 1, got ${args.length}`
    );
  }
  const first = args[0];
  assertNonNullable(first);
  if (first instanceof InternalArray && first.elements !== null) {
    if (first.elements.length > 0) {
      return first.elements[first.elements.length - 1];
    }
    return INTERNAL_NULL;
  }
  return createError(`TypeError: \`tail\` expects an array, got ${first.type}`);
};

export default {
  len: new StandardLibraryObject(len),
  head: new StandardLibraryObject(head),
  tail: new StandardLibraryObject(tail),
  last: new StandardLibraryObject(last),
};
