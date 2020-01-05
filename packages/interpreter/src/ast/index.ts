export { default as ArrayLiteral } from './nodes/array-literal';
export { default as BlockStatement } from './nodes/block-statement';
export { default as BooleanLiteral } from './nodes/boolean-literal';
export { default as CallExpression } from './nodes/call-expression';
export { default as ExpressionStatement } from './nodes/expression';
export { default as FunctionLiteral } from './nodes/function-literal';
export { default as HashLiteral } from './nodes/hash-literal';
export { default as Identifier } from './nodes/identifier';
export { default as IfExpression } from './nodes/if-expression';
export { default as IndexExpression } from './nodes/index-expression';
export { default as InfixExpression } from './nodes/infix-expression';
export { default as IntegerLiteral } from './nodes/integer-literal';
export { default as LetStatement } from './nodes/let';
export { default as PrefixExpression } from './nodes/prefix-expression';
export { default as Program } from './nodes/program';
export { default as ReturnStatement } from './nodes/return';
export { default as StringLiteral } from './nodes/string-literal';

export interface ASTNode {
  tokenLiteral(): string;
  toString(): string;
}

export interface Statement extends ASTNode {
  statementNode(): unknown;
}

export interface Expression extends ASTNode {
  expressionNode(): unknown;
}
