import { LeftBraceToken } from '../../token/';
import { Statement } from '../../ast/';

export default class BlockStatement implements Statement {
  public statements: Statement[] = [];
  constructor(public token: LeftBraceToken) {}

  statementNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    return this.statements.map(statement => statement.toString()).join('\n');
  }
}
