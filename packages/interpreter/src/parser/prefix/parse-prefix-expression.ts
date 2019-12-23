import Parser, { PrecedenceOrder } from '..';
import { Expression, PrefixExpression } from '../../ast';

export default function parsePrefixExpression(this: Parser): Expression {
  if (this.currToken === undefined) {
    throw new TypeError(`Was expecting ${this.currToken} to be defined`);
  }
  const prefixExpression = new PrefixExpression(
    this.currToken,
    this.currToken.literal
  );
  this.nextToken();
  let expression = this.parseExpression(PrecedenceOrder.PREFIX);
  if (expression) {
    prefixExpression.right = expression;
  }

  return prefixExpression;
}