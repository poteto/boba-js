import { Token, IdentToken } from '../../token/';
import { Expression } from '../../ast/';

export default class Identifier implements Expression {
  public token: Token;
  constructor(token: IdentToken, public value: string) {
    this.token = token;
  }

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }

  toString() {
    return this.value;
  }
}
