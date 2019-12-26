import { FunctionLiteralToken } from '../../token/';
import { BlockStatement, Identifier, Expression } from '../../ast/';

export default class FunctionLiteral implements Expression {
  public parameters: Identifier[] | null = null;
  public body: BlockStatement | null = null;
  constructor(public token: FunctionLiteralToken) {}

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    const parameters = this.parameters?.map(p => p.toString()).join(', ');
    let block = this.body?.toString();
    if (block?.length) {
      block = `{ ${this.body?.toString()} }`;
    } else {
      block = '{}';
    }
    return `${this.tokenLiteral()}(${parameters}) ${block}`;
  }
}
