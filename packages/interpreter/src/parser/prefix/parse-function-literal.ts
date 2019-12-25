import Parser from '..';
import { Expression } from '../../ast';
import { TokenType } from '../../token';
import FunctionLiteral from '../../ast/nodes/function-literal';
import { assertTokenType } from '../../utils/assertions';

export default function parseFunctionLiteral(this: Parser): Expression | null {
  if (this.currToken === undefined) {
    throw new TypeError(`Was expecting ${this.currToken} to be defined`);
  }
  assertTokenType(this.currToken, TokenType.FUNCTION);
  const expr = new FunctionLiteral(this.currToken);

  if (!this.expectPeek(TokenType.LPAREN)) {
    return null;
  }

  const parameters = this.parseFunctionParameters();
  if (parameters) {
    expr.parameters = parameters;
  }

  if (!this.expectPeek(TokenType.LBRACE)) {
    return null;
  }

  const body = this.parseBlockStatement();
  if (body) {
    expr.body = body;
  }

  return expr;
}
