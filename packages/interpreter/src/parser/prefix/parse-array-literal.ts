import Parser from '..';
import { ArrayLiteral, Expression } from '../../ast';
import { TokenType } from '../../token';

import assertTokenType from '../../utils/assert-token-type';
import assertNonNullable from '../../utils/assert-non-nullable';

export default function parseArrayLiteral(this: Parser): Expression {
  assertTokenType(this.currToken, TokenType.LBRACKET);
  const elements = this.parseExpressionList(TokenType.RBRACKET);
  assertNonNullable(elements);
  return new ArrayLiteral(this.currToken, elements);
}
