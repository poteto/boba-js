import Parser, { PrecedenceOrder } from '..';
import { Expression, PrefixExpression } from '../../ast';

export default function parsePrefixExpression(this: Parser): Expression {
  const expr = new PrefixExpression(
    this.currToken,
    this.currToken.literal
  );
  this.nextToken();
  expr.right = this.parseExpression(PrecedenceOrder.PREFIX);
  return expr;
}