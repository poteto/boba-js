import { LetStatementToken } from '../../token/';
import { Identifier, Expression, Statement } from '../../ast/';

export default class LetStatement implements Statement {
  public name?: Identifier;
  public value?: Expression;
  constructor(public token: LetStatementToken) {}

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
