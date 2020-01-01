import { AssertionError } from 'assert';

export default function assertNonNullable<T>(
  obj: T
): asserts obj is NonNullable<T> {
  if (obj === null || obj === undefined) {
    throw new AssertionError({
      message: `${obj} was not expected to be null or undefined`,
    });
  }
}
