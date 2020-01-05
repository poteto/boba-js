export { default as Environment } from './environment';
export { default as InternalArray } from './internal-array';
export { default as InternalBoolean } from './internal-boolean';
export { createError, default as InternalError } from './internal-error';
export { default as InternalFunction } from './internal-function';
export { default as InternalInteger } from './internal-integer';
export { default as InternalNull } from './internal-null';
export { default as InternalString } from './internal-string';
export { default as InternalReturnValue } from './internal-return-value';
export { default as StandardLibraryObject } from './standard-library-object';

export type HashKey = string;

export interface InternalObject {
  type: InternalObjectType;
  inspect(): string;
  toHashKey?(): HashKey;
}

export interface HashableInternalObject extends InternalObject {
  toHashKey(): HashKey;
}

export const enum InternalObjectType {
  INTEGER_OBJ = 'INTEGER',
  BOOLEAN_OBJ = 'BOOLEAN',
  NULL_OBJ = 'NULL',
  RETURN_VALUE_OBJ = 'RETURN_VALUE',
  ERROR_OBJ = 'ERROR',
  FUNCTION_OBJ = 'FUNCTION',
  STRING_OBJ = 'STRING',
  STDLIB_OBJ = 'STDLIB',
  ARRAY_OBJ = 'ARRAY',
  HASH_OBJ = 'HASH',
}
