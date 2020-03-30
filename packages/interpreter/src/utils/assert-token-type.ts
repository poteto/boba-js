import { Token, TokenType, LiteralType } from '../token';
import { AssertionError } from 'assert';

export default function assertTokenType<T extends TokenType>(
  token: Token,
  ...assertedTokenTypes: T[]
): asserts token is { type: T; literal: LiteralType } {
  const satisfiesAssertion = assertedTokenTypes.some(
    (type) => type === token.type
  );
  if (!satisfiesAssertion) {
    throw new AssertionError({
      message: `Token type is not: ${assertedTokenTypes.join(' OR ')}`,
    });
  }
}
