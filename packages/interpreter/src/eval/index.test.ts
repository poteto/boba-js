import {
  InternalObject,
  InternalInteger,
  InternalBoolean,
  InternalNull,
  InternalError,
} from './internal-objects';
import Lexer from '../lexer';
import Parser from '../parser';
import evaluate from '.';
import Environment from './internal-objects/environment';

function testEval(input: string): InternalObject | null {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const env = new Environment();
  return evaluate(parser.parseProgram(), env);
}

describe('when evaluating valid programs', () => {
  it('evaluates integer expressions', () => {
    const tests = [
      { input: '5', expected: 5 },
      { input: '10', expected: 10 },
      { input: '-5', expected: -5 },
      { input: '-10', expected: -10 },
      { input: '5 + 5 + 5 + 5 - 10', expected: 10 },
      { input: '2 * 2 * 2 * 2 * 2', expected: 32 },
      { input: '-50 + 100 + -50', expected: 0 },
      { input: '5 * 2 + 10', expected: 20 },
      { input: '5 + 2 * 10', expected: 25 },
      { input: '20 + 2 * -10', expected: 0 },
      { input: '50 / 2 * 2 + 10', expected: 60 },
      { input: '2 * (5 + 10)', expected: 30 },
      { input: '3 * 3 * 3 + 10', expected: 37 },
      { input: '3 * (3 * 3) + 10', expected: 37 },
      { input: '(5 + 10 * 2 + 15 / 3) * 2 + -10', expected: 50 },
    ];

    tests.forEach(test => {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(InternalInteger);
      expect((evaluated as InternalInteger).value).toBe(test.expected);
    });
  });

  it('evaluates boolean expressions', () => {
    const tests = [
      { input: 'true', expected: true },
      { input: 'false', expected: false },
      { input: '1 < 2', expected: true },
      { input: '1 > 2', expected: false },
      { input: '1 < 1', expected: false },
      { input: '1 > 1', expected: false },
      { input: '1 == 1', expected: true },
      { input: '1 != 1', expected: false },
      { input: '1 == 2', expected: false },
      { input: '1 != 2', expected: true },
      { input: 'true == true', expected: true },
      { input: 'false == false', expected: true },
      { input: 'true == false', expected: false },
      { input: 'true != false', expected: true },
      { input: 'false != true', expected: true },
      { input: '(1 < 2) == true', expected: true },
      { input: '(1 < 2) == false', expected: false },
      { input: '(1 > 2) == true', expected: false },
      { input: '(1 > 2) == false', expected: true },
    ];

    tests.forEach(test => {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(InternalBoolean);
      expect((evaluated as InternalBoolean).value).toBe(test.expected);
    });
  });

  it('evaluates bang operators', () => {
    const tests = [
      { input: '!true', expected: false },
      { input: '!false', expected: true },
      { input: '!0', expected: false },
      { input: '!!true', expected: true },
      { input: '!!false', expected: false },
      { input: '!!0', expected: true },
    ];

    tests.forEach(test => {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(InternalBoolean);
      expect((evaluated as InternalBoolean).value).toBe(test.expected);
    });
  });

  it('evaluates if/else expressions', () => {
    const tests = [
      { input: 'if (true) { 10 }', expected: 10 },
      { input: 'if (false) { 10 }', expected: null },
      { input: 'if (1) { 10 }', expected: 10 },
      { input: 'if (1 < 2) { 10 }', expected: 10 },
      { input: 'if (1 > 2) { 10 }', expected: null },
      { input: 'if (1 > 2) { 10 } else { 20 }', expected: 20 },
      { input: 'if (1 < 2) { 10 } else { 20 }', expected: 10 },
    ];

    const results = tests.map(({ input }) => testEval(input));
    expect(results.filter(res => res instanceof InternalNull).length).toBe(2);
    expect(results.filter(res => res instanceof InternalInteger).length).toBe(
      5
    );

    tests.forEach(test => {
      const evaluated = testEval(test.input);
      if (evaluated instanceof InternalInteger) {
        expect((evaluated as InternalInteger).value).toBe(test.expected);
      }
    });
  });

  it('evaluates return statements', () => {
    const tests = [
      { input: 'return 10', expected: 10 },
      { input: 'return 10; 9;', expected: 10 },
      { input: 'return 2 * 5; 9;', expected: 10 },
      { input: '9; return 2 * 5; 9;', expected: 10 },
      {
        input: `
        if (10 > 1) {
          if (10 > 1) {
            return 10;
          }
          return 1;
        }
      `,
        expected: 10,
      },
    ];

    tests.forEach(test => {
      const evaluated = testEval(test.input);
      expect(evaluated).toBeInstanceOf(InternalInteger);
      expect((evaluated as InternalInteger).value).toBe(test.expected);
    });
  });

  test.each([
    ['let a = 5; a;', 5],
    ['let a = 5 * 5; a;', 25],
    ['let a = 5; let b = a; b;', 5],
    ['let a = 5; let b = a; let c = a + b + 5; c;', 15],
  ])('it evaluates let statements for: %p', (input, expected) => {
    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(InternalInteger);
    expect((evaluated as InternalInteger).value).toBe(expected);
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
