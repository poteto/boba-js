import { TokenType } from '../token/';
import Lexer from '.';

describe('Lexer', () => {
  it('lexes operators and delimiters into tokens', () => {
    const input = '=+(){},;'.trim();
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
    const lexer = new Lexer(input);
    expected.forEach(test => expect(lexer.nextToken()).toEqual(test));
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

      if (5 < 10) {
        return true;
      } else {
        return false;
      }

      10 == 10;
      10 != 9;
      "laurentan";
      "lauren tan";
      [1, 2];
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
      { type: TokenType.IF, literal: 'if' },
      { type: TokenType.LPAREN, literal: '(' },
      { type: TokenType.INT, literal: '5' },
      { type: TokenType.LT, literal: '<' },
      { type: TokenType.INT, literal: '10' },
      { type: TokenType.RPAREN, literal: ')' },
      { type: TokenType.LBRACE, literal: '{' },
      { type: TokenType.RETURN, literal: 'return' },
      { type: TokenType.TRUE, literal: 'true' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.RBRACE, literal: '}' },
      { type: TokenType.ELSE, literal: 'else' },
      { type: TokenType.LBRACE, literal: '{' },
      { type: TokenType.RETURN, literal: 'return' },
      { type: TokenType.FALSE, literal: 'false' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.RBRACE, literal: '}' },
      { type: TokenType.INT, literal: '10' },
      { type: TokenType.EQ, literal: '==' },
      { type: TokenType.INT, literal: '10' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.INT, literal: '10' },
      { type: TokenType.NOT_EQ, literal: '!=' },
      { type: TokenType.INT, literal: '9' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.STRING, literal: 'laurentan' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.STRING, literal: 'lauren tan' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.LBRACKET, literal: '[' },
      { type: TokenType.INT, literal: '1' },
      { type: TokenType.COMMA, literal: ',' },
      { type: TokenType.INT, literal: '2' },
      { type: TokenType.RBRACKET, literal: ']' },
      { type: TokenType.SEMICOLON, literal: ';' },
      { type: TokenType.EOF, literal: '' },
    ];
    const lexer = new Lexer(input);
    expected.forEach(test => expect(lexer.nextToken()).toEqual(test));
  });
});