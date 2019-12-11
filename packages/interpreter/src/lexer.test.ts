import { TokenType } from '../src/token';
import lex from './lexer';

describe('Lexer', () => {
  it('lexes operators and delimiters into tokens', () => {
    const input = '=+(){},;';
    const expected = [
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.PLUS, literal: '+' },
      { type: TokenType.LPAREN, literal: '(' },
      { type: TokenType.RPAREN, literal: ')' },
      { type: TokenType.LBRACE, literal: '{' },
      { type: TokenType.RBRACE, literal: '}' },
      { type: TokenType.COMMA, literal: ',' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.EOF, literal: '' },
    ];
    const nextToken = lex(input);
    expected.forEach(test => expect(test).toEqual(nextToken()));
  });

  it('lexes an example program', () => {
    const input = `
      let five = 5;
      let ten = 10;

      let add = fn(x, y) {
        x + y;
      };

      let result = add(five, ten);
    `.trim();
    const expected = [
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'five' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.INT, literal: '5' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'ten' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.INT, literal: '10' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'add' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.FUNCTION, literal: 'fn' },
      { type: TokenType.LPAREN, literal: '(' },
      { type: TokenType.IDENT, literal: 'x' },
      { type: TokenType.COMMA, literal: ',' },
      { type: TokenType.IDENT, literal: 'y' },
      { type: TokenType.RPAREN, literal: ')' },
      { type: TokenType.LBRACE, literal: '{' },
      { type: TokenType.IDENT, literal: 'x' },
      { type: TokenType.PLUS, literal: '+' },
      { type: TokenType.IDENT, literal: 'y' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.RBRACE, literal: '}' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'result' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.IDENT, literal: 'add' },
      { type: TokenType.LPAREN, literal: '(' },
      { type: TokenType.IDENT, literal: 'five' },
      { type: TokenType.COMMA, literal: ',' },
      { type: TokenType.IDENT, literal: 'ten' },
      { type: TokenType.RPAREN, literal: ')' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.EOF, literal: '' },
    ];
    const nextToken = lex(input);
    expected.forEach(test => expect(test).toEqual(nextToken()));
  });

  it('lexes additional operators and keywords', () => {
    const input = `
      let five = 5;
      let ten = 10;

      let add = fn(x, y) {
        x + y;
      };

      let result = add(five, ten);
      !-/*5;
      5 < 10 > 5;
    `;
    const expected = [
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'five' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.INT, literal: '5' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'ten' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.INT, literal: '10' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'add' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.FUNCTION, literal: 'fn' },
      { type: TokenType.LPAREN, literal: '(' },
      { type: TokenType.IDENT, literal: 'x' },
      { type: TokenType.COMMA, literal: ',' },
      { type: TokenType.IDENT, literal: 'y' },
      { type: TokenType.RPAREN, literal: ')' },
      { type: TokenType.LBRACE, literal: '{' },
      { type: TokenType.IDENT, literal: 'x' },
      { type: TokenType.PLUS, literal: '+' },
      { type: TokenType.IDENT, literal: 'y' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.RBRACE, literal: '}' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.LET, literal: 'let' },
      { type: TokenType.IDENT, literal: 'result' },
      { type: TokenType.ASSIGN, literal: '=' },
      { type: TokenType.IDENT, literal: 'add' },
      { type: TokenType.LPAREN, literal: '(' },
      { type: TokenType.IDENT, literal: 'five' },
      { type: TokenType.COMMA, literal: ',' },
      { type: TokenType.IDENT, literal: 'ten' },
      { type: TokenType.RPAREN, literal: ')' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.BANG, literal: '!' },
      { type: TokenType.MINUS, literal: '-' },
      { type: TokenType.SLASH, literal: '/' },
      { type: TokenType.ASTERISK, literal: '*' },
      { type: TokenType.INT, literal: '5' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.INT, literal: '5' },
      { type: TokenType.LT, literal: '<' },
      { type: TokenType.INT, literal: '10' },
      { type: TokenType.GT, literal: '>' },
      { type: TokenType.INT, literal: '5' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.EOF, literal: '' },
    ];
    const nextToken = lex(input);
    expected.forEach(test => expect(test).toEqual(nextToken()));
  });
});