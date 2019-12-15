import { Token } from '../../token/';
import { Expression } from '../../ast/';

export default class InfixExpression implements Expression {
  public left?: Expression;
  public right?: Expression;
  constructor(public token: Token, public operator: string) {}

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    return `(${this.left?.toString()} ${
      this.operator
    } ${this.right?.toString()})`;
  }
}
