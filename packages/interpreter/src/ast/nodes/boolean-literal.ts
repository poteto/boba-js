import { Token, BooleanLiteralToken } from '../../token/';
import { Expression } from '../../ast/';

export default class BooleanLiteral implements Expression {
  public token: Token;
  constructor(token: BooleanLiteralToken, public value: boolean) {
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
