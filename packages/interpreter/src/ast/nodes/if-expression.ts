import { IfExpressionToken } from '../../token/';
import { Expression } from '../../ast/';
import BlockStatement from './block-statement';

export default class IfExpression implements Expression {
  public condition?: Expression;
  public consequence?: BlockStatement;
  public alternative?: BlockStatement;
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
