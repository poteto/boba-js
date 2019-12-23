import Parser from '..';
import { Expression, InfixExpression } from '../../ast';

export default function parseInfixExpression(this: Parser, left: Expression): Expression {
  if (this.currToken === undefined) {
    throw new TypeError(`Was expecting ${this.currToken} to be defined`);
  }
  const infixExpression = new InfixExpression(
    this.currToken,
    this.currToken.literal
  );
  infixExpression.left = left;
  const precedence = this.currPrecedence();
  this.nextToken();

  const rightExpression = this.parseExpression(precedence);
  if (rightExpression) {
    infixExpression.right = rightExpression;
  }

  return infixExpression;
}