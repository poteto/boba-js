import { LeftParenToken } from '../../token/';
import { Expression } from '../../ast/';

export default class CallExpression implements Expression {
  constructor(
    public token: LeftParenToken,
    public fn: Expression,
    public args: Expression[] | null
  ) {}

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    return `${this.fn?.toString()}(${this.args
      ?.map((arg) => arg.toString())
      .join(', ')})`;
  }
}
