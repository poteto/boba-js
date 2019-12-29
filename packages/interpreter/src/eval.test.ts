import { InternalObject, InternalInteger, InternalBoolean } from './object';
import Lexer from './lexer';
import Parser from './parser';
import evaluate from './eval';

function testEval(input: string): InternalObject | null {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  return evaluate(parser.parseProgram());
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
});
