import createToken, { Token, TokenType, lookupIdentifier } from './token';

type Lexer = {
  input: string;
  position: number; // current position in input (points to current char)
  readPosition: number; // current reading position in input (after current char)
  ch: string | 0; // current char under examination
};

type ToStringable = {
  toString(): string;
};

const lettersRegex = /[A-Za-z_]/;
const whitespaceRegex = /\s/;
const digitsRegex = /\d/;
function isLetter<T extends ToStringable>(ch: T) {
  return lettersRegex.test(ch.toString()) === true;
}
function isWhitespace<T extends ToStringable>(ch: T) {
  return whitespaceRegex.test(ch.toString()) === true;
}
function isDigit<T extends ToStringable>(ch: T) {
  return digitsRegex.test(ch.toString()) === true;
}

export default function lex(input: string) {
  let lexer: Lexer = { input, position: 0, readPosition: 0, ch: 0 };
  function peekChar() {
    if (lexer.readPosition >= input.length) {
      return 0;
    }
    return lexer.input[lexer.readPosition];
  }
  function readChar() {
    if (lexer.readPosition >= lexer.input.length) {
      lexer.ch = 0;
    } else {
      lexer.ch = lexer.input[lexer.readPosition];
    }
    lexer.position = lexer.readPosition;
    lexer.readPosition += 1;
  }
  function readIdentifier() {
    let position = lexer.position;
    while (isLetter(lexer.ch)) {
      readChar();
    }
    return lexer.input.substring(position, lexer.position);
  }
  function readNumber() {
    let position = lexer.position;
    while (isDigit(lexer.ch)) {
      readChar();
    }
    return lexer.input.substring(position, lexer.position);
  }
  function skipWhitespace() {
    while (isWhitespace(lexer.ch)) {
      readChar();
    }
  }
  function nextToken(): Token {
    let token: Token;
    skipWhitespace();
    switch (lexer.ch) {
      case '=':
        if (peekChar() === '=') {
          const ch = lexer.ch;
          readChar();
          const literal = ch + lexer.ch;
          token = createToken(TokenType.EQ, literal);
          break;
        }
        token = createToken(TokenType.ASSIGN, lexer.ch);
        break;
      case '+':
        token = createToken(TokenType.PLUS, lexer.ch);
        break;
      case '-':
        token = createToken(TokenType.MINUS, lexer.ch);
        break;
      case '!':
        if (peekChar() === '=') {
          const ch = lexer.ch;
          readChar();
          const literal = ch + lexer.ch;
          token = createToken(TokenType.NOT_EQ, literal);
          break;
        }
        token = createToken(TokenType.BANG, lexer.ch);
        break;
      case '/':
        token = createToken(TokenType.SLASH, lexer.ch);
        break;
      case '*':
        token = createToken(TokenType.ASTERISK, lexer.ch);
        break;
      case '<':
        token = createToken(TokenType.LT, lexer.ch);
        break;
      case '>':
        token = createToken(TokenType.GT, lexer.ch);
        break;
      case ',':
        token = createToken(TokenType.COMMA, lexer.ch);
        break;
      case ';':
        token = createToken(TokenType.SEMICOLON, lexer.ch);
        break;
      case '(':
        token = createToken(TokenType.LPAREN, lexer.ch);
        break;
      case ')':
        token = createToken(TokenType.RPAREN, lexer.ch);
        break;
      case '{':
        token = createToken(TokenType.LBRACE, lexer.ch);
        break;
      case '}':
        token = createToken(TokenType.RBRACE, lexer.ch);
        break;
      case 0:
        token = createToken(TokenType.EOF, '');
        break;
      default:
        if (isLetter(lexer.ch)) {
          const literal = readIdentifier();
          return createToken(lookupIdentifier(literal), literal);
        } else if (isDigit(lexer.ch)) {
          return createToken(TokenType.INT, readNumber());
        } else {
          token = createToken(TokenType.ILLEGAL, lexer.ch);
          break;
        }
    }
    readChar();
    return token;
  }
  readChar();
  return nextToken;
}
