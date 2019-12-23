import { Token, LetStatementToken } from '../../token/';
import { Identifier, Expression, Statement } from '../../ast/';

export default class LetStatement implements Statement {
  public token: Token;
  public name?: Identifier;
  public value?: Expression;
  constructor(token: LetStatementToken) {
    this.token = token;
  }

  statementNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    let value;
    if (this.value !== null) {
      value = this.value?.toString();
    }
    return `${this.tokenLiteral()} ${this.name?.toString()} = ${value};`;
  }
}
