import Parser, { PrecedenceOrder } from '..';
import { IfExpression, Expression } from '../../ast';
import { TokenType } from '../../token';
import assertTokenType from '../../utils/assert-token-type';

export default function parseIfExpression(this: Parser): Expression | null {
  assertTokenType(this.currToken, TokenType.IF);
  const expr = new IfExpression(this.currToken);

  if (!this.expectPeek(TokenType.LPAREN)) {
    return null;
  }
  this.nextToken();

  expr.condition = this.parseExpression(PrecedenceOrder.LOWEST);

  if (!this.expectPeek(TokenType.RPAREN)) {
    return null;
  }

  if (!this.expectPeek(TokenType.LBRACE)) {
    return null;
  }

  expr.consequence = this.parseBlockStatement();

  if (this.peekTokenIs(TokenType.ELSE)) {
    this.nextToken();

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }

    expr.alternative = this.parseBlockStatement();
  }

  return expr;
}
