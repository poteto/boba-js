import Parser from '..';
import { Expression, Identifier } from '../../ast';
import { TokenType } from '../../token';

import assertTokenType from '../../utils/assert-token-type';

export default function parseIdentifier(this: Parser): Expression {
  assertTokenType(this.currToken, TokenType.IDENT);
  return new Identifier(this.currToken, this.currToken.literal);
}
