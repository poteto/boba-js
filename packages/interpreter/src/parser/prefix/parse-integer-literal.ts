import Parser from '..';
import { Expression, IntegerLiteral } from '../../ast';
import { assertTokenType } from '../../utils/assertions';
import { TokenType } from '../../token';

export default function parseIntegerLiteral(this: Parser): Expression {
  if (this.currToken === undefined) {
    throw new TypeError(`Was expecting ${this.currToken} to be defined`);
  }
  assertTokenType(this.currToken, TokenType.INT);
  return new IntegerLiteral(this.currToken, parseInt(this.currToken.literal));
}
