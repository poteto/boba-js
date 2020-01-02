import hasOwnProperty from '../utils/has-own-property';

export const enum TokenType {
  ILLEGAL = 'ILLEGAL',
  EOF = 'EOF',

  // Identifiers + Literals
  IDENT = 'IDENT',
  INT = 'INT',

  STRING = 'STRING',

  // Operators
  ASSIGN = '=',
  PLUS = '+',
  MINUS = '-',
  BANG = '!',
  ASTERISK = '*',
  SLASH = '/',

  LT = '<',
  GT = '>',

  EQ = '==',
  NOT_EQ = '!=',

  // Delimiters
  COMMA = ',',
  SEMICOLON = ';',

  LPAREN = '(',
  RPAREN = ')',
  LBRACE = '{',
  RBRACE = '}',
  LBRACKET = '[',
  RBRACKET = ']',

  // Keywords
  FUNCTION = 'FUNCTION',
  LET = 'LET',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  IF = 'IF',
  ELSE = 'ELSE',
  RETURN = 'RETURN',
}

export type LiteralType = string;
export type Token = {
  type: TokenType;
  literal: LiteralType;
};

export type BooleanLiteralToken = {
  type: TokenType.TRUE | TokenType.FALSE;
  literal: LiteralType;
};
export type IdentToken = { type: TokenType.IDENT; literal: LiteralType };
export type IntegerLiteralToken = { type: TokenType.INT; literal: LiteralType };
export type StringLiteralToken = {
  type: TokenType.STRING;
  literal: LiteralType;
};
export type LetStatementToken = { type: TokenType.LET; literal: LiteralType };
export type ReturnStatementToken = {
  type: TokenType.RETURN;
  literal: LiteralType;
};
export type IfExpressionToken = { type: TokenType.IF; literal: LiteralType };
export type LeftParenToken = { type: TokenType.LPAREN; literal: LiteralType };
export type LeftBraceToken = { type: TokenType.LBRACE; literal: LiteralType };
export type LeftBracketToken = {
  type: TokenType.LBRACKET;
  literal: LiteralType;
};
export type FunctionLiteralToken = {
  type: TokenType.FUNCTION;
  literal: LiteralType;
};

const KEYWORDS = {
  fn: TokenType.FUNCTION,
  let: TokenType.LET,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  if: TokenType.IF,
  else: TokenType.ELSE,
  return: TokenType.RETURN,
} as const;

export default function createToken(
  type: TokenType,
  literal: LiteralType
): Token {
  return { type, literal };
}

export function lookupIdentifier(ident: string) {
  if (hasOwnProperty(KEYWORDS, ident)) {
    return KEYWORDS[ident];
  }
  return TokenType.IDENT;
}
