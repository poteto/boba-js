import { Token } from '../../token/';
import { Expression, Statement } from '../../ast/';

export default class ExpressionStatement implements Statement {
  public expression?: Expression;
  constructor(public token: Token) {}

  statementNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    // TODO fixme
    if (this.expression === undefined) {
      return '';
    }
    if (this.expression !== null) {
      return this.expression?.toString();
    }
    return '';
  }
}
