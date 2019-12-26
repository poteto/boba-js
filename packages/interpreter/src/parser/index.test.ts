import Lexer from '../lexer';
import Parser from '../parser';

import {
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
  BooleanLiteral,
} from '../ast/';
import IfExpression from '../ast/nodes/if-expression';
import FunctionLiteral from '../ast/nodes/function-literal';
import CallExpression from '../ast/nodes/call-expression';

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
      expect(program?.statements.length).toBe(expected.length);
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
      expect(program?.statements.length).toBe(expected.length);
      expect(parser.errors.length).toBe(0);

      (program.statements as ExpressionStatement[]).forEach(statement => {
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.expression).toBeInstanceOf(InfixExpression);
      });

      expected.forEach((test, idx) =>
        expect(program.statements[idx].toString()).toBe(test)
      );
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
        1 + (2 + 3) + 4;
        (5 + 5) * 2;
        2 / (5 + 5);
        -(5 + 5);
        !(true == true);
        a + add(b * c) + d;
        add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8));
        add(a + b + c * d / f + g);
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
        '((1 + (2 + 3)) + 4)',
        '((5 + 5) * 2)',
        '(2 / (5 + 5))',
        '(-(5 + 5))',
        '(!(true == true))',
        '((a + add((b * c))) + d)',
        'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))',
        'add((((a + b) + ((c * d) / f)) + g))',
      ];

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(expected.length);
      expect(parser.errors.length).toBe(0);

      (program.statements as ExpressionStatement[]).forEach(statement =>
        expect(statement).toBeInstanceOf(ExpressionStatement)
      );

      expected.forEach((test, idx) =>
        expect(program.statements[idx].toString()).toBe(test)
      );
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
      expect(program?.statements.length).toBe(expected.length);
      expect(parser.errors.length).toBe(0);

      (program.statements as ExpressionStatement[]).forEach(statement => {
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.expression).toBeInstanceOf(BooleanLiteral);
      });

      expected.forEach((test, idx) =>
        expect(program.statements[idx].toString()).toBe(test)
      );
    });

    it('parses if expressions', () => {
      const input = `
        if (x < y) { x };
        if (x < y) { x } else { y };
      `.trim();
      const expected = ['if (x < y) then x', 'if (x < y) then x else y'];

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(expected.length);
      expect(parser.errors.length).toBe(0);

      (program.statements as ExpressionStatement[]).forEach(statement => {
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.expression).toBeInstanceOf(IfExpression);
      });

      expected.forEach((test, idx) =>
        expect(program.statements[idx].toString()).toBe(test)
      );
    });

    it('parses function literals', () => {
      const input = `
        fn(x, y) { return x + y; };
        fn() {};
        fn(x) {};
        fn(x, y, z) {};
      `.trim();
      const expected = [
        'fn(x, y) { return (x + y); }',
        'fn() {}',
        'fn(x) {}',
        'fn(x, y, z) {}',
      ];

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(expected.length);
      expect(parser.errors.length).toBe(0);

      (program.statements as ExpressionStatement[]).forEach(statement => {
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.expression).toBeInstanceOf(FunctionLiteral);
      });

      expected.forEach((test, idx) =>
        expect(program.statements[idx].toString()).toBe(test)
      );
    });

    it('parses call expressions', () => {
      const input = `
        add(1, 2 * 3, 4 + 5);
      `.trim();
      const expected = ['add(1, (2 * 3), (4 + 5))'];

      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program).not.toBeNull();
      expect(program?.statements.length).toBe(expected.length);
      expect(parser.errors.length).toBe(0);

      (program.statements as ExpressionStatement[]).forEach(statement => {
        expect(statement).toBeInstanceOf(ExpressionStatement);
        expect(statement.expression).toBeInstanceOf(CallExpression);
      });

      expected.forEach((test, idx) =>
        expect(program.statements[idx].toString()).toBe(test)
      );
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
