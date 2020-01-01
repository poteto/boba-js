import { StringLiteralToken } from '../../token/';
import { Expression } from '../../ast/';

export default class StringLiteral implements Expression {
  constructor(public token: StringLiteralToken, public value: string) {}

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    return this.token.literal;
  }
}
