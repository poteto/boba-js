import { Token, ReturnStatementToken } from '../../token/';
import { Expression, Statement } from '../../ast/';

export default class ReturnStatement implements Statement {
  public token: Token;
  public returnValue?: Expression;
  constructor(token: ReturnStatementToken) {
    this.token = token;
  }

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
