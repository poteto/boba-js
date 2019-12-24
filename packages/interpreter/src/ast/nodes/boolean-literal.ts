import { BooleanLiteralToken } from '../../token/';
import { Expression } from '../../ast/';

export default class BooleanLiteral implements Expression {
  constructor(public token: BooleanLiteralToken, public value: boolean) {}

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    return this.token.literal;
  }
}
