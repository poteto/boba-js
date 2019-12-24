import { IdentToken } from '../../token/';
import { Expression } from '../../ast/';

export default class Identifier implements Expression {
  constructor(public token: IdentToken, public value: string) {}

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }

  toString() {
    return this.value;
  }
}
