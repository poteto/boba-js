import { Token } from '../../token/';
import { Expression } from '../../ast/';

export default class InfixExpression implements Expression {
  public right: Expression | null = null;
  constructor(
    public token: Token,
    public operator: string,
    public left: Expression | null = null
  ) {}

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
