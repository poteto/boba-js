import { LeftBracketToken } from '../../token/';
import { Expression } from '../../ast/';
import { Maybe } from '../../utils/maybe';

export default class IndexExpression implements Expression {
  public index: Maybe<Expression> = null;
  constructor(public token: LeftBracketToken, public left: Expression) {}

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    return `(${this.left.toString()}[${this.index?.toString()}])`;
  }
}
