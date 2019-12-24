import { IntegerLiteralToken } from '../../token/';
import { Expression } from '../../ast/';

export default class IntegerLiteral implements Expression {
  constructor(public token: IntegerLiteralToken, public value: number) {}

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    return this.token.literal;
  }
}
