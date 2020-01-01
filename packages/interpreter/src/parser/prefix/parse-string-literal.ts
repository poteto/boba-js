import Parser from '..';
import { Expression, StringLiteral } from '../../ast';
import assertTokenType from '../../utils/assert-token-type';
import { TokenType } from '../../token';

export default function parseStringLiteral(this: Parser): Expression {
  assertTokenType(this.currToken, TokenType.STRING);
  return new StringLiteral(this.currToken, this.currToken.literal);
}
