import Parser from '..';
import { CallExpression, Expression } from '../../ast';
import assertTokenType from '../../utils/assert-token-type';
import { TokenType } from '../../token';

export default function parseCallExpression(
  this: Parser,
  fn: Expression
): Expression {
  assertTokenType(this.currToken, TokenType.LPAREN);
  return new CallExpression(this.currToken, fn, this.parseCallArguments());
}
