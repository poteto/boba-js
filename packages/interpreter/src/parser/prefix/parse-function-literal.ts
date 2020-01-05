import Parser from '..';
import { Expression, FunctionLiteral } from '../../ast';
import { TokenType } from '../../token';

import assertTokenType from '../../utils/assert-token-type';

export default function parseFunctionLiteral(this: Parser): Expression | null {
  assertTokenType(this.currToken, TokenType.FUNCTION);
  const expr = new FunctionLiteral(this.currToken);

  if (!this.expectPeek(TokenType.LPAREN)) {
    return null;
  }

  expr.parameters = this.parseFunctionParameters();

  if (!this.expectPeek(TokenType.LBRACE)) {
    return null;
  }

  expr.body = this.parseBlockStatement();
  return expr;
}
