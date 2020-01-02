import {
  createError,
  InternalString,
  InternalInteger,
  InternalArray,
  StandardLibraryObject,
} from './internal-objects';
import { INTERNAL_NULL } from './internal-objects/internal-null';
import { StandardLibraryFunction } from './internal-objects/standard-library-object';

import assertNonNullable from '../utils/assert-non-nullable';

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
  return createError(`TypeError: \`last\` expects an array, got ${first.type}`);
};

const push: StandardLibraryFunction = function stdlib__push(...args) {
  if (args.length !== 2) {
    return createError(
      `Wrong number of arguments. Expected 2, got ${args.length}`
    );
  }
  const [first, last] = args;
  assertNonNullable(first);
  assertNonNullable(last);
  if (first instanceof InternalArray && first.elements !== null) {
    first.elements.push(last);
    return first;
  }
  return createError(
    `TypeError: \`push\` expects an array and value, got ${first.type} and ${last.type}`
  );
};

export default {
  len: new StandardLibraryObject(len),
  head: new StandardLibraryObject(head),
  tail: new StandardLibraryObject(tail),
  last: new StandardLibraryObject(last),
  push: new StandardLibraryObject(push),
};
