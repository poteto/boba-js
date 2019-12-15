import { Token, IntegerLiteralToken } from '../../token/';
import { Expression } from '../../ast/';

export default class IntegerLiteral implements Expression {
  public token: Token;
  constructor(token: IntegerLiteralToken, public value: number) {
    this.token = token;
  }

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    return this.token.literal;
  }
}
