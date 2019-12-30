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
}

export function createError(
  message: string,
  ...args: unknown[]
): InternalError {
  return new InternalError(`${message}${args.join(' ')}`);
}

export class InternalInteger implements InternalObject {
  constructor(public value: number) {}

  get type() {
    return InternalObjectType.INTEGER_OBJ;
  }

  inspect() {
    return this.value.toString();
  }
}

export class InternalBoolean implements InternalObject {
  constructor(public value: boolean) {}

  get type() {
    return InternalObjectType.BOOLEAN_OBJ;
  }

  inspect() {
    return this.value.toString();
  }
}

export class InternalNull implements InternalObject {
  get type() {
    return InternalObjectType.NULL_OBJ;
  }

  inspect() {
    return 'null';
  }
}

export class InternalReturnValue implements InternalObject {
  constructor(public value: InternalObject) {}

  get type() {
    return InternalObjectType.RETURN_VALUE_OBJ;
  }

  inspect() {
    return this.value.inspect();
  }
}

export class InternalError implements InternalObject {
  constructor(public message: string) {}

  get type() {
    return InternalObjectType.ERROR_OBJ;
  }

  inspect() {
    return `Error: ${this.message}`;
  }
}
