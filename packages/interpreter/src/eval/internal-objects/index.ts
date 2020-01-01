export { default as Environment } from './environment';
export { default as InternalBoolean } from './internal-boolean';
export { createError, default as InternalError } from './internal-error';
export { default as InternalFunction } from './internal-function';
export { default as InternalInteger } from './internal-integer';
export { default as InternalNull } from './internal-null';
export { default as InternalString } from './internal-string';
export { default as InternalReturnValue } from './internal-return-value';

export interface InternalObject {
  type: InternalObjectType;
  inspect(): string;
}

export const enum InternalObjectType {
  INTEGER_OBJ = 'INTEGER',
  BOOLEAN_OBJ = 'BOOLEAN',
  NULL_OBJ = 'NULL',
  RETURN_VALUE_OBJ = 'RETURN_VALUE',
  ERROR_OBJ = 'ERROR',
  FUNCTION_OBJ = 'FUNCTION',
  STRING_OBJ = 'STRING',
}