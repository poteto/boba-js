import Lexer from '../lexer';
import Parser from '../parser';

import {
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
  Expression,
  Identifier,
  BooleanLiteral,
} from '../ast/';

function testIntegerLiteral(expr: Expression | undefined, value: number): void {
  expect(expr).toBeInstanceOf(IntegerLiteral);
  expect((expr as IntegerLiteral).value).toBe(value);
  expect((expr as IntegerLiteral).tokenLiteral()).toBe(value.toString());
}
function testBooleanLiteral(
  expr: Expression | undefined,
  value: boolean
): void {
  expect(expr).toBeInstanceOf(BooleanLiteral);
  expect((expr as Identifier).value).toBe(value);
  expect((expr as Identifier).tokenLiteral()).toBe(value);
}
function testIdentifier(expr: Expression | undefined, value: string): void {
  expect(expr).toBeInstanceOf(Identifier);
  expect((expr as Identifier).value).toBe(value);
  expect((expr as Identifier).tokenLiteral()).toBe(value);
}
function testLiteralExpression(
  expr: Expression | undefined,
  expected: unknown
): void {
  switch (typeof expected) {
    case 'number':
      return testIntegerLiteral(expr, expected);
    case 'string':
      return testIdentifier(expr, expected);
    case 'boolean':
      return testBooleanLiteral(expr, expected);
    default:
      break;
  }
}
function testInfixExpression(
  expr: Expression,
  left: unknown,
  operator: string,
  right: unknown
): void {
  expect(expr).toBeInstanceOf(InfixExpression);
  testLiteralExpression((expr as InfixExpression).left, left);
  expect((expr as InfixExpression).operator).toBe(operator);
  testLiteralExpression((expr as InfixExpression).right, right);
}

describe('Parser', () => {
  describe('when the program is valid', () => {
    it('parses let statements', () => {
      const input = `
        let x = 5;
        let y = 10;
        let foobar = 1337;
      `.trim();

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(3);
      expect(parser.errors.length).toBe(0);

      program.statements.forEach(statement =>
        expect(statement).toBeInstanceOf(LetStatement)
      );
      expect(program.toString()).toEqual(
        'let x = 5;\nlet y = 10;\nlet foobar = 1337;'
      );
    });

    it('parses return statements', () => {
      const input = `
        return 5;
        return 10;
        return 1337;
      `.trim();

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(3);
      expect(parser.errors.length).toBe(0);

      (program.statements as ReturnStatement[]).forEach(statement => {
        expect(statement).toBeInstanceOf(ReturnStatement);
        expect(statement.returnValue).toBeInstanceOf(IntegerLiteral);
      });
      expect(program.toString()).toEqual('return 5;\nreturn 10;\nreturn 1337;');
    });

    it('parses identifier expressions', () => {
      const input = `x`.trim();
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(1);
      expect(parser.errors.length).toBe(0);

      program.statements.forEach(statement =>
        expect(statement).toBeInstanceOf(ExpressionStatement)
      );
      expect(program.toString()).toEqual('x');
    });

    it('parses integer literal expressions', () => {
      const input = `5`.trim();
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(1);
      expect(parser.errors.length).toBe(0);

      (program.statements as ExpressionStatement[]).forEach(statement => {
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.expression).toBeInstanceOf(IntegerLiteral);
      });
      expect(program.toString()).toEqual('5');
    });

    it('parses prefix expressions', () => {
      const input = `
        !5;
        -15;
        !true;
        !false;
      `.trim();
      const expected = ['(!5)', '(-15)', '(!true)', '(!false)'];

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(4);
      expect(parser.errors.length).toBe(0);

      (program.statements as ExpressionStatement[]).forEach(statement => {
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.expression).toBeInstanceOf(PrefixExpression);
      });

      expected.forEach((test, idx) =>
        expect(program.statements[idx].toString()).toBe(test)
      );
    });

    it('parses infix expressions', () => {
      const input = `
        5 + 5;
        5 - 5;
        5 * 5;
        5 / 5;
        5 > 5;
        5 < 5;
        5 == 5;
        5 != 5;
        true == true;
        true != false;
        false == false;
      `.trim();
      const expected = [
        '(5 + 5)',
        '(5 - 5)',
        '(5 * 5)',
        '(5 / 5)',
        '(5 > 5)',
        '(5 < 5)',
        '(5 == 5)',
        '(5 != 5)',
        '(true == true)',
        '(true != false)',
        '(false == false)',
      ];
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(11);
      expect(parser.errors.length).toBe(0);

      (program.statements as ExpressionStatement[]).forEach(statement => {
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.expression).toBeInstanceOf(InfixExpression);
      });

      expected.forEach((test, idx) => {
        expect(program.statements[idx].toString()).toBe(test);
      });
    });

    it('handles operator precedence parsing', () => {
      const input = `
        -a * b;
        !-a;
        a + b + c;
        a + b - c;
        a * b * c;
        a * b / c;
        a + b / c;
        a + b * c + d / e - f;
        3 + 4; -5 * 5;
        5 > 4 == 3 < 4;
        5 < 4 != 3 > 4;
        3 + 4 * 5 == 3 * 1 + 4 * 5;
        true;
        false;
        3 > 5 == false;
        3 < 5 == false;
      `.trim();
      const expected = [
        '((-a) * b)',
        '(!(-a))',
        '((a + b) + c)',
        '((a + b) - c)',
        '((a * b) * c)',
        '((a * b) / c)',
        '(a + (b / c))',
        '(((a + (b * c)) + (d / e)) - f)',
        '(3 + 4)',
        '((-5) * 5)',
        '((5 > 4) == (3 < 4))',
        '((5 < 4) != (3 > 4))',
        '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))',
        'true',
        'false',
        '((3 > 5) == false)',
        '((3 < 5) == false)',
      ];

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(17);
      expect(parser.errors.length).toBe(0);

      (program.statements as ExpressionStatement[]).forEach(statement =>
        expect(statement).toBeInstanceOf(ExpressionStatement)
      );

      expected.forEach((test, idx) => {
        expect(program.statements[idx].toString()).toBe(test);
      });
    });

    it('parses boolean literal expressions', () => {
      const input = `
        true;
        false;
      `.trim();
      const expected = ['true', 'false'];

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(2);
      expect(parser.errors.length).toBe(0);

      (program.statements as ExpressionStatement[]).forEach(statement => {
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.expression).toBeInstanceOf(BooleanLiteral);
      });

      expected.forEach((test, idx) => {
        expect(program.statements[idx].toString()).toBe(test);
      });
    });
  });

  describe('when the program is invalid', () => {
    it('parses the errors from let statements', () => {
      const input = `
        let x 5;
        let = 10;
        let foobar 1337;
      `.trim();

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(parser.errors.length).toBe(4);
    });
  });
});
