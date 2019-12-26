import { IfExpressionToken } from '../../token/';
import { Expression, BlockStatement } from '../../ast/';

export default class IfExpression implements Expression {
  public condition: Expression | null = null;
  public consequence: BlockStatement | null = null;
  public alternative: BlockStatement | null = null;
  constructor(public token: IfExpressionToken) {}

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    let str = `if ${this.condition?.toString()} then ${this.consequence?.toString()}`;
    if (this.alternative) {
      str += ` else ${this.alternative?.toString()}`;
    }
    return str;
  }
}
