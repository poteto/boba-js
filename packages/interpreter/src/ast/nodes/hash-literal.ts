import { LeftBraceToken } from '../../token/';
import { Expression } from '../../ast/';

type HashPairs = Map<Expression, Expression>;

export default class HashLiteral implements Expression {
  constructor(public token: LeftBraceToken, public pairs: HashPairs) {}

  expressionNode() {}
  tokenLiteral() {
    return this.token.literal;
  }
  toString() {
    const pairs = [];
    for (const [key, value] of this.pairs.entries()) {
      pairs.push(`${key}: ${value}`);
    }
    if (pairs.length > 0) {
      return `{ ${pairs.join(', ')} }`;
    }
    return `{}`;
  }
}
