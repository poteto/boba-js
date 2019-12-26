import { Token } from '../../token/';
import { Expression, Statement } from '../../ast/';

export default class ExpressionStatement implements Statement {
  constructor(public token: Token, public expression: Expression | null) {}

  statementNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    if (this.expression === undefined) {
      return '';
    }
    if (this.expression !== null) {
      return this.expression?.toString();
    }
    return '';
  }
}
