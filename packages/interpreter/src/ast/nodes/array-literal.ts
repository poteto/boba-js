import { LeftBracketToken } from '../../token/';
import { Expression } from '../../ast/';

export default class ArrayLiteral implements Expression {
  constructor(public token: LeftBracketToken, public elements: Expression[]) {}

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    const elements = this.elements
      .map(element => element.toString())
      .join(', ');
    return `[${elements}]`;
  }
}
