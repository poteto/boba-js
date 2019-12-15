import {
  Token,
  TokenType,
  LetStatementToken,
  IntegerLiteralToken,
  ReturnStatementToken,
  IdentToken,
  BooleanLiteralToken,
} from '../token';
import { AssertionError } from 'assert';

export function assertIsLetToken(
  token: Token
): asserts token is LetStatementToken {
  if (token.type !== TokenType.LET) {
    throw new AssertionError({
      message: `Token is not of type ${TokenType.LET}`,
    });
  }
}

export function assertIsIdentToken(token: Token): asserts token is IdentToken {
  if (token.type !== TokenType.IDENT) {
    throw new AssertionError({
      message: `Token is not of type ${TokenType.IDENT}`,
    });
  }
}

export function assertIsIntToken(
  token: Token
): asserts token is IntegerLiteralToken {
  if (token.type !== TokenType.INT) {
    throw new AssertionError({
      message: `Token is not of type ${TokenType.INT}`,
    });
  }
}

export function assertIsReturnToken(
  token: Token
): asserts token is ReturnStatementToken {
  if (token.type !== TokenType.RETURN) {
    throw new AssertionError({
      message: `Token is not of type ${TokenType.RETURN}`,
    });
  }
}

export function assertIsBooleanLiteralToken(
  token: Token
): asserts token is BooleanLiteralToken {
  if (!(token.type === TokenType.TRUE || token.type === TokenType.FALSE)) {
    throw new AssertionError({
      message: `Token is not of type ${TokenType.TRUE} or ${TokenType.FALSE}`,
    });
  }
}
