import Parser from '..';
import { Expression, BooleanLiteral } from '../../ast';
import { assertIsBooleanLiteralToken } from '../../utils/assertions';
import { TokenType } from '../../token';

export default function parseBoolean(this: Parser): Expression {
  if (this.currToken === undefined) {
    throw new TypeError(`Was expecting ${this.currToken} to be defined`);
  }
  assertIsBooleanLiteralToken(this.currToken);
  return new BooleanLiteral(this.currToken, this.currTokenIs(TokenType.TRUE));
}