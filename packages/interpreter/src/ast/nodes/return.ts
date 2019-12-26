import { ReturnStatementToken } from '../../token/';
import { Expression, Statement } from '../../ast/';

export default class ReturnStatement implements Statement {
  public returnValue: Expression | null = null;
  constructor(public token: ReturnStatementToken) {}

  statementNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    let returnValue;
    if (this.returnValue !== null) {
      returnValue = this.returnValue?.toString();
    }
    return `${this.tokenLiteral()} ${returnValue};`;
  }
}
