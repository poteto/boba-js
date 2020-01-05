import Parser from '..';
import { Expression, IntegerLiteral } from '../../ast';
import { TokenType } from '../../token';

import assertTokenType from '../../utils/assert-token-type';

export default function parseIntegerLiteral(this: Parser): Expression {
  assertTokenType(this.currToken, TokenType.INT);
  return new IntegerLiteral(this.currToken, parseInt(this.currToken.literal));
}
