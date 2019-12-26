import Parser from '..';
import { Expression, BooleanLiteral } from '../../ast';
import assertTokenType from '../../utils/assert-token-type';
import { TokenType } from '../../token';

export default function parseBoolean(this: Parser): Expression {
  assertTokenType(this.currToken, TokenType.TRUE, TokenType.FALSE)
  return new BooleanLiteral(this.currToken, this.currTokenIs(TokenType.TRUE));
}