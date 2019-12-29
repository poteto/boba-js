// TODO rename this
export interface InternalObject {
  type(): InternalObjectType;
  inspect(): string;
}

export const enum InternalObjectType {
  INTEGER_OBJ = 'INTEGER',
  BOOLEAN_OBJ = 'BOOLEAN',
  NULL_OBJ = 'NULL',
}

export class InternalInteger implements InternalObject {
  constructor(public value: number) {}

  type() {
    return InternalObjectType.INTEGER_OBJ;
  }

  inspect() {
    return this.value.toString();
  }
}

export class InternalBoolean implements InternalObject {
  constructor(public value: boolean) {}

  type() {
    return InternalObjectType.BOOLEAN_OBJ;
  }

  inspect() {
    return this.value.toString();
  }
}

export class InternalNull implements InternalObject {
  type() {
    return InternalObjectType.NULL_OBJ;
  }

  inspect() {
    return 'null';
  }
}
