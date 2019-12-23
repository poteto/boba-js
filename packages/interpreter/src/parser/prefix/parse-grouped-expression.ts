import Parser, { PrecedenceOrder } from '..';
import { Expression } from '../../ast';
import { TokenType } from '../../token';

export default function parseGroupedExpression(
  this: Parser
): Expression | null {
  this.nextToken();
  const expr = this.parseExpression(PrecedenceOrder.LOWEST);
  if (!this.expectPeek(TokenType.RPAREN)) {
    return null;
  }
  return expr;
}
