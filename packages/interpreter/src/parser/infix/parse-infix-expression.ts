import Parser from '..';
import { Expression, InfixExpression } from '../../ast';

export default function parseInfixExpression(
  this: Parser,
  left: Expression
): Expression {
  const expr = new InfixExpression(
    this.currToken,
    this.currToken.literal,
    left
  );
  const precedence = this.currPrecedence();
  this.nextToken();

  expr.right = this.parseExpression(precedence);
  return expr;
}
