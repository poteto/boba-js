import { Statement, ASTNode } from '../../ast/';

export default class Program implements ASTNode {
  public statements: Statement[] = [];

  tokenLiteral(): string {
    if (this.statements.length) {
      return this.statements[0].tokenLiteral();
    }
    return '';
  }

  toString() {
    return this.statements.map((statement) => statement.toString()).join('\n');
  }
}
