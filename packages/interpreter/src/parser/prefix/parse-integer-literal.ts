import Parser from '..';
import { Expression, IntegerLiteral } from '../../ast';
import { assertIsIntToken } from '../../utils/assertions';

export default function parseIntegerLiteral(this: Parser): Expression {
  if (this.currToken === undefined) {
    throw new TypeError(`Was expecting ${this.currToken} to be defined`);
  }
  assertIsIntToken(this.currToken);
  return new IntegerLiteral(this.currToken, parseInt(this.currToken.literal));
}