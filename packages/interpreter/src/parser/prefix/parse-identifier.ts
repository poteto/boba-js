import Parser from '..';
import { Expression, Identifier } from '../../ast';
import { assertIsIdentToken } from '../../utils/assertions';

export default function parseIdentifier(this: Parser): Expression {
  if (this.currToken === undefined) {
    throw new TypeError(`Was expecting ${this.currToken} to be defined`);
  }
  assertIsIdentToken(this.currToken);
  return new Identifier(this.currToken, this.currToken.literal);
}