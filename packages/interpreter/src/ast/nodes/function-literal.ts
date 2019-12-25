import { FunctionLiteralToken } from '../../token/';
import { Identifier, Expression } from '../../ast/';
import BlockStatement from './block-statement';

export default class FunctionLiteral implements Expression {
  public parameters?: Identifier[];
  public body?: BlockStatement;
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
