import Parser from '..';
import { CallExpression, Expression } from '../../ast';
import { TokenType } from '../../token';

import assertTokenType from '../../utils/assert-token-type';

export default function parseCallExpression(
  this: Parser,
  fn: Expression
): Expression {
  assertTokenType(this.currToken, TokenType.LPAREN);
  return new CallExpression(
    this.currToken,
    fn,
    this.parseExpressionList(TokenType.RPAREN)
  );
}
