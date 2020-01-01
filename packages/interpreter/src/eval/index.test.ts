import {
  Environment,
  InternalObject,
  InternalInteger,
  InternalBoolean,
  InternalNull,
  InternalError,
  InternalString,
} from './internal-objects';
import Lexer from '../lexer';
import Parser from '../parser';
import evaluate from '.';
import { Maybe } from '../utils/maybe';

function testEval(input: string): Maybe<InternalObject> {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const env = new Environment();
  return evaluate(parser.parseProgram(), env);
}

describe('when evaluating integer expressions', () => {
  test.each([
    ['5', 5],
    ['10', 10],
    ['-5', -5],
    ['-10', -10],
    ['5 + 5 + 5 + 5 - 10', 10],
    ['2 * 2 * 2 * 2 * 2', 32],
    ['-50 + 100 + -50', 0],
    ['5 * 2 + 10', 20],
    ['5 + 2 * 10', 25],
    ['20 + 2 * -10', 0],
    ['50 / 2 * 2 + 10', 60],
    ['2 * (5 + 10)', 30],
    ['3 * 3 * 3 + 10', 37],
    ['3 * (3 * 3) + 10', 37],
    ['(5 + 10 * 2 + 15 / 3) * 2 + -10', 50],
  ])('it evaluates: %p', (input, expected) => {
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(InternalInteger);
    expect((evaluated as InternalInteger).value).toBe(expected);
  });
});

describe('when evaluating boolean expressions', () => {
  test.each([
    ['true', true],
    ['false', false],
    ['1 < 2', true],
    ['1 > 2', false],
    ['1 < 1', false],
    ['1 > 1', false],
    ['1 == 1', true],
    ['1 != 1', false],
    ['1 == 2', false],
    ['1 != 2', true],
    ['true == true', true],
    ['false == false', true],
    ['true == false', false],
    ['true != false', true],
    ['false != true', true],
    ['(1 < 2) == true', true],
    ['(1 < 2) == false', false],
    ['(1 > 2) == true', false],
    ['(1 > 2) == false', true],
  ])('it evaluates: %p', (input, expected) => {
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(InternalBoolean);
    expect((evaluated as InternalBoolean).value).toBe(expected);
  });
});

describe('when evaluating bang operators', () => {
  test.each([
    ['!true', false],
    ['!false', true],
    ['!0', false],
    ['!!true', true],
    ['!!false', false],
    ['!!0', true],
  ])('it evaluates: %p', (input, expected) => {
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(InternalBoolean);
    expect((evaluated as InternalBoolean).value).toBe(expected);
  });
});

describe('when evaluating return statements', () => {
  test.each([
    ['return 10;', 10],
    ['return 10; 9;', 10],
    ['return 2 * 5; 9;', 10],
    ['9; return 2 * 5; 9;', 10],
    [
      `
    if (10 > 1) {
      if (10 > 1) {
        return 10;
      }
      return 1;
    }
  `,
      10,
    ],
  ])('it evaluates: %p', (input, expected) => {
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(InternalInteger);
    expect((evaluated as InternalInteger).value).toBe(expected);
  });
});

describe('when evaluating let statements', () => {
  test.each([
    ['let a = 5; a;', 5],
    ['let a = 5 * 5; a;', 25],
    ['let a = 5; let b = a; b;', 5],
    ['let a = 5; let b = a; let c = a + b + 5; c;', 15],
  ])('it evaluates: %p', (input, expected) => {
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(InternalInteger);
    expect((evaluated as InternalInteger).value).toBe(expected);
  });
});

describe('when evaluating call expressions', () => {
  test.each([
    ['let identity = fn(x) { x; }; identity(5);', 5],
    ['let identity = fn(x) { return x; }; identity(5);', 5],
    ['let double = fn(x) { x * 2; }; double(5);', 10],
    ['let add = fn(x, y) { x + y; }; add(5, 5);', 10],
    ['let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));', 20],
    ['fn(x) { x; }(5)', 5],
    [
      `
      let a = true;
      let b = 10000;
      let x = -1000;
      let y = -10000;
      let newAdder = fn(x) {
        let a = 5;
        fn(y) {
          let b = 6;
          a + b + x + y;
        };
      };
      let addTwo = newAdder(2);
      addTwo(2);
    `,
      15,
    ],
  ])('it evaluates: %p', (input, expected) => {
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(InternalInteger);
    expect((evaluated as InternalInteger).value).toBe(expected);
  });
});

describe('when evaluating if/else expressions', () => {
  test.each([
    ['if (false) { 10 }', null],
    ['if (true) { 10 }', 10],
    ['if (1) { 10 }', 10],
    ['if (1 < 2) { 10 }', 10],
    ['if (1 > 2) { 10 }', null],
    ['if (1 > 2) { 10 } else { 20 }', 20],
    ['if (1 < 2) { 10 } else { 20 }', 10],
  ])('it evaluates: %p', (input, expected) => {
    const evaluated = testEval(input);
    if (evaluated instanceof InternalInteger) {
      expect((evaluated as InternalInteger).value).toBe(expected);
      return;
    }
    expect(evaluated).toBeInstanceOf(InternalNull);
  });
});

describe('when evaluating string literal expressions', () => {
  describe('when they are valid', () => {
    test.each([
      ['"hello world!"', 'hello world!'],
      ['"hello" + " " + "world!"', 'hello world!'],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(evaluated).toBeInstanceOf(InternalString);
      expect((evaluated as InternalString).value).toBe(expected);
    });
  });

  describe('when they are invalid', () => {
    test.each([['"hello" - "world"', 'UnknownOperator: STRING - STRING']])(
      'it evaluates: %p',
      (input, expected) => {
        const evaluated = testEval(input);
        expect(evaluated).toBeInstanceOf(InternalError);
        expect((evaluated as InternalError).message).toBe(expected);
      }
    );
  });
});

describe('when evaluating stdlib:len', () => {
  describe('when valid', () => {
    test.each([
      ['len("")', 0],
      ['len("lauren")', 6],
      ['len("hello world")', 11],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(evaluated).toBeInstanceOf(InternalInteger);
      expect((evaluated as InternalInteger).value).toBe(expected);
    });
  });

  describe('when invalid', () => {
    test.each([
      ['len(1)', 'TypeError: `len` expects a string, got INTEGER'],
      ['len(1 + 2)', 'TypeError: `len` expects a string, got INTEGER'],
      ['len(true)', 'TypeError: `len` expects a string, got BOOLEAN'],
      ['len(fn(x) {})', 'TypeError: `len` expects a string, got FUNCTION'],
      [
        'len(if (true) { 1 })',
        'TypeError: `len` expects a string, got INTEGER',
      ],
      ['len()', 'Wrong number of arguments. Expected 1, got 0'],
      ['len("hello", "world")', 'Wrong number of arguments. Expected 1, got 2'],
    ])('it evaluates and handles errors for: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(evaluated).toBeInstanceOf(InternalError);
      expect((evaluated as InternalError).message).toBe(expected);
    });
  });
});

describe('when evaluating invalid programs', () => {
  test.each([
    ['5 + true;', 'TypeError: INTEGER + BOOLEAN'],
    ['5 + true; 5;', 'TypeError: INTEGER + BOOLEAN'],
    ['-true', 'UnknownOperator: -BOOLEAN'],
    ['-false', 'UnknownOperator: -BOOLEAN'],
    ['true + false', 'UnknownOperator: BOOLEAN + BOOLEAN'],
    ['5; true + false; 5', 'UnknownOperator: BOOLEAN + BOOLEAN'],
    ['if (10 > 1) { true + false; }', 'UnknownOperator: BOOLEAN + BOOLEAN'],
    [
      `
      if (10 > 1) {
        if (10 > 1) {
          return true + false;
        }
        return 1;
      }
    `,
      'UnknownOperator: BOOLEAN + BOOLEAN',
    ],
    ['foo', 'ReferenceError: foo is not defined'],
  ])('it evaluates and handles errors for: %p', (input, expected) => {
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(InternalError);
    expect((evaluated as InternalError).message).toBe(expected);
  });
});
