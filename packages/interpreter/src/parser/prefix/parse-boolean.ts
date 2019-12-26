import Parser from '..';
import { Expression, BooleanLiteral } from '../../ast';
import { assertTokenType } from '../../utils/assertions';
import { TokenType } from '../../token';

export default function parseBoolean(this: Parser): Expression {
  if (this.currToken === undefined) {
    throw new TypeError(`Was expecting ${this.currToken} to be defined`);
  }
  assertTokenType(this.currToken, TokenType.TRUE, TokenType.FALSE)
  return new BooleanLiteral(this.currToken, this.currTokenIs(TokenType.TRUE));
}