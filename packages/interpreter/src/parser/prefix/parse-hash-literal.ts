import Parser, { PrecedenceOrder } from '..';
import { Expression } from '../../ast';
import { TokenType } from '../../token';
import assertTokenType from '../../utils/assert-token-type';
import HashLiteral from '../../ast/nodes/hash-literal';
import { Maybe } from '../../utils/maybe';

export default function parseHashLiteral(this: Parser): Maybe<Expression> {
  assertTokenType(this.currToken, TokenType.LBRACE);
  const pairs = new Map();

  while (!this.peekTokenIs(TokenType.RBRACE)) {
    this.nextToken();
    const key = this.parseExpression(PrecedenceOrder.LOWEST);

    if (!this.expectPeek(TokenType.COLON)) {
      return null;
    }

    this.nextToken();
    const value = this.parseExpression(PrecedenceOrder.LOWEST);

    pairs.set(key, value);

    if (
      !this.peekTokenIs(TokenType.RBRACE) &&
      !this.expectPeek(TokenType.COMMA)
    ) {
      return null;
    }
  }

  if (!this.expectPeek(TokenType.RBRACE)) {
    return null;
  }

  return new HashLiteral(this.currToken, pairs);
}
