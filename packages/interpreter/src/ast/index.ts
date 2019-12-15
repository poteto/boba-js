export { default as BooleanLiteral } from './nodes/boolean-literal';
export { default as ExpressionStatement } from './nodes/expression';
export { default as Identifier } from './nodes/identifier';
export { default as InfixExpression } from './nodes/infix-expression';
export { default as IntegerLiteral } from './nodes/integer-literal';
export { default as LetStatement } from './nodes/let';
export { default as PrefixExpression } from './nodes/prefix-expression';
export { default as Program } from './nodes/program';
export { default as ReturnStatement } from './nodes/return';

export interface Node {
  tokenLiteral(): string;
  toString(): string;
}

export interface Statement extends Node {
  statementNode(): unknown;
}

export interface Expression extends Node {
  expressionNode(): unknown;
}
