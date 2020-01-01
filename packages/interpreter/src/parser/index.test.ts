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
  Program,
  Identifier,
  IfExpression,
  FunctionLiteral,
  CallExpression,
  StringLiteral,
} from '../ast/';

function testParse(input: string): [Parser, Program] {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  return [parser, parser.parseProgram()];
}

describe('when parsing let statements', () => {
  describe('when they are valid', () => {
    test.each([
      [
        'let x = 5;',
        'let x = 5;',
        { token: { literal: '5', type: 'INT' }, value: 5 },
      ],
      [
        'let y = 10;',
        'let y = 10;',
        { token: { literal: '10', type: 'INT' }, value: 10 },
      ],
      [
        'let foobar = 1337;',
        'let foobar = 1337;',
        { token: { literal: '1337', type: 'INT' }, value: 1337 },
      ],
    ])('it parses: %p', (input, string, token) => {
      const [parser, program] = testParse(input);
      expect(program).not.toBeNull();
      expect(parser.errors.length).toBe(0);
      expect(program?.statements.length).toBe(1);
      expect(program.toString()).toEqual(string);

      const statement = program?.statements[0] as LetStatement;
      expect(statement).toBeInstanceOf(LetStatement);
      expect(statement.value).toEqual(token);
    });
  });

  describe('when they are invalid', () => {
    test.each([
      ['let x 5;', 1],
      ['let = 10;', 2],
      ['let foobar 1337;', 1],
    ])('it parses the errors: %p', (input, errorCount) => {
      const [parser, program] = testParse(input);
      expect(program).not.toBeNull();
      expect(parser.errors.length).toBe(errorCount);
    });
  });
});

describe('when parsing return statements', () => {
  test.each([
    [
      'return 5;',
      'return 5;',
      { token: { literal: '5', type: 'INT' }, value: 5 },
    ],
    [
      'return 10;',
      'return 10;',
      { token: { literal: '10', type: 'INT' }, value: 10 },
    ],
    [
      'return 1337;',
      'return 1337;',
      { token: { literal: '1337', type: 'INT' }, value: 1337 },
    ],
  ])('it parses: %p', (input, string, token) => {
    const [parser, program] = testParse(input);
    expect(program).not.toBeNull();
    expect(parser.errors.length).toBe(0);
    expect(program?.statements.length).toBe(1);
    expect(program.toString()).toEqual(string);

    const statement = program?.statements[0] as ReturnStatement;
    expect(statement).toBeInstanceOf(ReturnStatement);
    expect(statement.returnValue).toBeInstanceOf(IntegerLiteral);
    expect(statement.returnValue).toEqual(token);
  });
});

describe('when parsing identifier expressions', () => {
  test.each([
    ['foo', 'foo', { token: { literal: 'foo', type: 'IDENT' }, value: 'foo' }],
    ['bar', 'bar', { token: { literal: 'bar', type: 'IDENT' }, value: 'bar' }],
    ['baz', 'baz', { token: { literal: 'baz', type: 'IDENT' }, value: 'baz' }],
  ])('it parses: %p', (input, string, token) => {
    const [parser, program] = testParse(input);
    expect(program).not.toBeNull();
    expect(parser.errors.length).toBe(0);
    expect(program?.statements.length).toBe(1);
    expect(program.toString()).toEqual(string);

    const statement = program?.statements[0] as ExpressionStatement;
    expect(statement).toBeInstanceOf(ExpressionStatement);
    expect(statement.expression).toBeInstanceOf(Identifier);
    expect(statement.expression).toEqual(token);
  });
});

describe('when parsing integer literal expressions', () => {
  test.each([
    ['5', '5', { token: { literal: '5', type: 'INT' }, value: 5 }],
    ['10', '10', { token: { literal: '10', type: 'INT' }, value: 10 }],
    ['1337', '1337', { token: { literal: '1337', type: 'INT' }, value: 1337 }],
  ])('it parses: %p', (input, string, token) => {
    const [parser, program] = testParse(input);
    expect(program).not.toBeNull();
    expect(parser.errors.length).toBe(0);
    expect(program?.statements.length).toBe(1);
    expect(program.toString()).toEqual(string);

    const statement = program?.statements[0] as ExpressionStatement;
    expect(statement).toBeInstanceOf(ExpressionStatement);
    expect(statement.expression).toBeInstanceOf(IntegerLiteral);
    expect(statement.expression).toEqual(token);
  });
});

describe('when parsing prefix expressions', () => {
  test.each([
    [
      '!5;',
      '(!5)',
      {
        operator: '!',
        right: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        token: {
          literal: '!',
          type: '!',
        },
      },
    ],
    [
      '-15;',
      '(-15)',
      {
        operator: '-',
        right: {
          token: {
            literal: '15',
            type: 'INT',
          },
          value: 15,
        },
        token: {
          literal: '-',
          type: '-',
        },
      },
    ],
    [
      '!true;',
      '(!true)',
      {
        operator: '!',
        right: {
          token: {
            literal: 'true',
            type: 'TRUE',
          },
          value: true,
        },
        token: {
          literal: '!',
          type: '!',
        },
      },
    ],
    [
      '!false;',
      '(!false)',
      {
        operator: '!',
        right: {
          token: {
            literal: 'false',
            type: 'FALSE',
          },
          value: false,
        },
        token: {
          literal: '!',
          type: '!',
        },
      },
    ],
  ])('it parses: %p', (input, string, token) => {
    const [parser, program] = testParse(input);
    expect(program).not.toBeNull();
    expect(parser.errors.length).toBe(0);
    expect(program?.statements.length).toBe(1);
    expect(program.toString()).toEqual(string);

    const statement = program?.statements[0] as ExpressionStatement;
    expect(statement).toBeInstanceOf(ExpressionStatement);
    expect(statement.expression).toBeInstanceOf(PrefixExpression);
    expect(statement.expression).toEqual(token);
  });
});

describe('when parsing infix expressions', () => {
  test.each([
    [
      '5 + 5;',
      '(5 + 5)',
      {
        left: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        operator: '+',
        right: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        token: {
          literal: '+',
          type: '+',
        },
      },
    ],
    [
      '5 - 5;',
      '(5 - 5)',
      {
        left: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        operator: '-',
        right: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        token: {
          literal: '-',
          type: '-',
        },
      },
    ],
    [
      '5 * 5;',
      '(5 * 5)',
      {
        left: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        operator: '*',
        right: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        token: {
          literal: '*',
          type: '*',
        },
      },
    ],
    [
      '5 / 5;',
      '(5 / 5)',
      {
        left: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        operator: '/',
        right: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        token: {
          literal: '/',
          type: '/',
        },
      },
    ],
    [
      '5 > 5;',
      '(5 > 5)',
      {
        left: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        operator: '>',
        right: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        token: {
          literal: '>',
          type: '>',
        },
      },
    ],
    [
      '5 < 5;',
      '(5 < 5)',
      {
        left: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        operator: '<',
        right: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        token: {
          literal: '<',
          type: '<',
        },
      },
    ],
    [
      '5 == 5;',
      '(5 == 5)',
      {
        left: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        operator: '==',
        right: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        token: {
          literal: '==',
          type: '==',
        },
      },
    ],
    [
      '5 != 5;',
      '(5 != 5)',
      {
        left: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        operator: '!=',
        right: {
          token: {
            literal: '5',
            type: 'INT',
          },
          value: 5,
        },
        token: {
          literal: '!=',
          type: '!=',
        },
      },
    ],
    [
      'true == true;',
      '(true == true)',
      {
        left: {
          token: {
            literal: 'true',
            type: 'TRUE',
          },
          value: true,
        },
        operator: '==',
        right: {
          token: {
            literal: 'true',
            type: 'TRUE',
          },
          value: true,
        },
        token: {
          literal: '==',
          type: '==',
        },
      },
    ],
    [
      'true != false;',
      '(true != false)',
      {
        left: {
          token: {
            literal: 'true',
            type: 'TRUE',
          },
          value: true,
        },
        operator: '!=',
        right: {
          token: {
            literal: 'false',
            type: 'FALSE',
          },
          value: false,
        },
        token: {
          literal: '!=',
          type: '!=',
        },
      },
    ],
    [
      'false == false;',
      '(false == false)',
      {
        left: {
          token: {
            literal: 'false',
            type: 'FALSE',
          },
          value: false,
        },
        operator: '==',
        right: {
          token: {
            literal: 'false',
            type: 'FALSE',
          },
          value: false,
        },
        token: {
          literal: '==',
          type: '==',
        },
      },
    ],
  ])('it parses: %p', (input, string, token) => {
    const [parser, program] = testParse(input);
    expect(program).not.toBeNull();
    expect(parser.errors.length).toBe(0);
    expect(program?.statements.length).toBe(1);
    expect(program.toString()).toEqual(string);

    const statement = program?.statements[0] as ExpressionStatement;
    expect(statement).toBeInstanceOf(ExpressionStatement);
    expect(statement.expression).toBeInstanceOf(InfixExpression);
    expect(statement.expression).toEqual(token);
  });
});

describe('when parsing with operator precedence', () => {
  test.each([
    ['-a * b;', '((-a) * b)'],
    ['!-a;', '(!(-a))'],
    ['a + b + c;', '((a + b) + c)'],
    ['a + b - c;', '((a + b) - c)'],
    ['a * b * c;', '((a * b) * c)'],
    ['a * b / c;', '((a * b) / c)'],
    ['a + b / c;', '(a + (b / c))'],
    ['a + b * c + d / e - f;', '(((a + (b * c)) + (d / e)) - f)'],
    ['3 + 4;', '(3 + 4)'],
    ['-5 * 5;', '((-5) * 5)'],
    ['5 > 4 == 3 < 4;', '((5 > 4) == (3 < 4))'],
    ['5 < 4 != 3 > 4;', '((5 < 4) != (3 > 4))'],
    ['3 + 4 * 5 == 3 * 1 + 4 * 5;', '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))'],
    ['true;', 'true'],
    ['false;', 'false'],
    ['3 > 5 == false;', '((3 > 5) == false)'],
    ['3 < 5 == false;', '((3 < 5) == false)'],
    ['1 + (2 + 3) + 4;', '((1 + (2 + 3)) + 4)'],
    ['(5 + 5) * 2;', '((5 + 5) * 2)'],
    ['2 / (5 + 5);', '(2 / (5 + 5))'],
    ['-(5 + 5);', '(-(5 + 5))'],
    ['!(true == true);', '(!(true == true))'],
    ['a + add(b * c) + d;', '((a + add((b * c))) + d)'],
    [
      'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8));',
      'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))',
    ],
    ['add(a + b + c * d / f + g);', 'add((((a + b) + ((c * d) / f)) + g))'],
  ])('it parses: %p', (input, string) => {
    const [parser, program] = testParse(input);
    expect(program).not.toBeNull();
    expect(parser.errors.length).toBe(0);
    expect(program?.statements.length).toBe(1);
    expect(program.toString()).toEqual(string);

    const statement = program?.statements[0] as ExpressionStatement;
    expect(statement).toBeInstanceOf(ExpressionStatement);
  });
});

describe('when parsing boolean literal expressions', () => {
  test.each([
    ['true', 'true', { token: { literal: 'true', type: 'TRUE' }, value: true }],
    [
      'false',
      'false',
      { token: { literal: 'false', type: 'FALSE' }, value: false },
    ],
  ])('it parses: %p', (input, string, token) => {
    const [parser, program] = testParse(input);
    expect(program).not.toBeNull();
    expect(parser.errors.length).toBe(0);
    expect(program?.statements.length).toBe(1);
    expect(program.toString()).toEqual(string);

    const statement = program?.statements[0] as ExpressionStatement;
    expect(statement).toBeInstanceOf(ExpressionStatement);
    expect(statement.expression).toBeInstanceOf(BooleanLiteral);
    expect(statement.expression).toEqual(token);
  });
});

describe('when parsing if expressions', () => {
  test.each([
    ['if (x < y) { x };', 'if (x < y) then x'],
    ['if (x < y) { x } else { y };', 'if (x < y) then x else y'],
  ])('it parses: %p', (input, string) => {
    const [parser, program] = testParse(input);
    expect(program).not.toBeNull();
    expect(parser.errors.length).toBe(0);
    expect(program?.statements.length).toBe(1);
    expect(program.toString()).toEqual(string);

    const statement = program?.statements[0] as ExpressionStatement;
    expect(statement).toBeInstanceOf(ExpressionStatement);
    expect(statement.expression).toBeInstanceOf(IfExpression);
  });
});

describe('when parsing function literal expressions', () => {
  test.each([
    ['fn(x, y) { return x + y; };', 'fn(x, y) { return (x + y); }'],
    ['fn() {};', 'fn() {}'],
    ['fn(x) {};', 'fn(x) {}'],
    ['fn(x, y, z) {};', 'fn(x, y, z) {}'],
  ])('it parses: %p', (input, string) => {
    const [parser, program] = testParse(input);
    expect(program).not.toBeNull();
    expect(parser.errors.length).toBe(0);
    expect(program?.statements.length).toBe(1);
    expect(program.toString()).toEqual(string);

    const statement = program?.statements[0] as ExpressionStatement;
    expect(statement).toBeInstanceOf(ExpressionStatement);
    expect(statement.expression).toBeInstanceOf(FunctionLiteral);
  });
});

describe('when parsing call expressions', () => {
  test.each([['add(1, 2 * 3, 4 + 5);', 'add(1, (2 * 3), (4 + 5))']])(
    'it parses: %p',
    (input, string) => {
      const [parser, program] = testParse(input);
      expect(program).not.toBeNull();
      expect(parser.errors.length).toBe(0);
      expect(program?.statements.length).toBe(1);
      expect(program.toString()).toEqual(string);

      const statement = program?.statements[0] as ExpressionStatement;
      expect(statement).toBeInstanceOf(ExpressionStatement);
      expect(statement.expression).toBeInstanceOf(CallExpression);
    }
  );
});

describe('when parsing string literal expressions', () => {
  test.each([['"hello world"', 'hello world']])(
    'it parses: %p',
    (input, string) => {
      const [parser, program] = testParse(input);
      expect(program).not.toBeNull();
      expect(parser.errors.length).toBe(0);
      expect(program?.statements.length).toBe(1);
      expect(program.toString()).toEqual(string);

      const statement = program?.statements[0] as ExpressionStatement;
      expect(statement).toBeInstanceOf(ExpressionStatement);
      expect(statement.expression).toBeInstanceOf(StringLiteral);
    }
  );
});
