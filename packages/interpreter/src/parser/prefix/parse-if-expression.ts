import Parser, { PrecedenceOrder } from '..';
import { IfExpression, Expression } from '../../ast';
import { assertTokenType } from '../../utils/assertions';
import { TokenType } from '../../token';

export default function parseIfExpression(this: Parser): Expression | null {
  if (this.currToken === undefined) {
    throw new TypeError(`Was expecting ${this.currToken} to be defined`);
  }
  assertTokenType(this.currToken, TokenType.IF);
  const expr = new IfExpression(this.currToken);

  if (!this.expectPeek(TokenType.LPAREN)) {
    return null;
  }
  this.nextToken();

  const condition = this.parseExpression(PrecedenceOrder.LOWEST);
  if (condition) {
    expr.condition = condition;
  }

  if (!this.expectPeek(TokenType.RPAREN)) {
    return null;
  }

  if (!this.expectPeek(TokenType.LBRACE)) {
    return null;
  }

  const consequence = this.parseBlockStatement();
  if (consequence) {
    expr.consequence = consequence;
  }

  if (this.peekTokenIs(TokenType.ELSE)) {
    this.nextToken();

    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }

    const alternative = this.parseBlockStatement();
    if (alternative) {
      expr.alternative = alternative;
    }
  }

  return expr;
}
