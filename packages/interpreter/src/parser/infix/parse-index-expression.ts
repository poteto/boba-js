import Parser, { PrecedenceOrder } from '..';
import { IndexExpression, Expression } from '../../ast';
import { TokenType } from '../../token';

import assertTokenType from '../../utils/assert-token-type';
import { Maybe } from '../../utils/maybe';

export default function parseIndexExpression(
  this: Parser,
  left: Expression
): Maybe<Expression> {
  assertTokenType(this.currToken, TokenType.LBRACKET);
  const expr = new IndexExpression(this.currToken, left);
  this.nextToken();
  expr.index = this.parseExpression(PrecedenceOrder.LOWEST);
  if (!this.expectPeek(TokenType.RBRACKET)) {
    return null;
  }
  return expr;
}
