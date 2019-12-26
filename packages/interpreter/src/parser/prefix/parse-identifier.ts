import Parser from '..';
import { Expression, Identifier } from '../../ast';
import { assertTokenType } from '../../utils/assertions';
import { TokenType } from '../../token';

export default function parseIdentifier(this: Parser): Expression {
  if (this.currToken === undefined) {
    throw new TypeError(`Was expecting ${this.currToken} to be defined`);
  }
  assertTokenType(this.currToken, TokenType.IDENT);
  return new Identifier(this.currToken, this.currToken.literal);
}