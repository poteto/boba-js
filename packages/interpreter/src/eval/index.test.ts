import {
  Environment,
  InternalObject,
  InternalInteger,
  InternalBoolean,
  InternalError,
  InternalString,
  InternalArray,
} from './internal-objects';
import Lexer from '../lexer';
import Parser from '../parser';
import evaluate from '.';
import { Maybe } from '../utils/maybe';
import { INTERNAL_NULL } from './internal-objects/internal-null';
import {
  INTERNAL_TRUE,
  INTERNAL_FALSE,
} from './internal-objects/internal-boolean';

function getValue(obj: Maybe<InternalObject>): unknown | unknown[] {
  const stack = [obj];
  const results = [];
  while (stack.length) {
    const next = stack.pop();
    if (next instanceof InternalArray) {
      stack.push(...next.elements);
      continue;
    }
    if (next === INTERNAL_NULL) {
      results.unshift(null);
      continue;
    }
    if (next === INTERNAL_TRUE) {
      results.unshift(true);
      continue;
    }
    if (next === INTERNAL_FALSE) {
      results.unshift(false);
      continue;
    }
    if (
      next instanceof InternalBoolean ||
      next instanceof InternalString ||
      next instanceof InternalInteger
    ) {
      results.unshift(next.value);
      continue;
    }
    if (next instanceof InternalError) {
      results.unshift(next.message);
      continue;
    }
    throw new Error(`I don't know how to get value for ${next}`);
  }
  return results.length > 1 ? results : results[0];
}

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
    expect(getValue(evaluated)).toBe(expected);
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
    expect(getValue(evaluated)).toBe(expected);
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
    expect(getValue(evaluated)).toBe(expected);
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
    expect(getValue(evaluated)).toBe(expected);
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
    expect(getValue(evaluated)).toBe(expected);
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
    expect(getValue(evaluated)).toBe(expected);
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
    expect(getValue(evaluated)).toBe(expected);
  });
});

describe('when evaluating string literal expressions', () => {
  describe('when they are valid', () => {
    test.each([
      ['"hello world!"', 'hello world!'],
      ['"hello" + " " + "world!"', 'hello world!'],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(getValue(evaluated)).toBe(expected);
    });
  });

  describe('when they are invalid', () => {
    test.each([['"hello" - "world"', 'UnknownOperator: STRING - STRING']])(
      'it evaluates: %p',
      (input, expected) => {
        const evaluated = testEval(input);
        expect(getValue(evaluated)).toBe(expected);
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
      ['len([1, 2, 3])', 3],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(getValue(evaluated)).toBe(expected);
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
      [
        'len(["hello"], "world")',
        'Wrong number of arguments. Expected 1, got 2',
      ],
    ])('it evaluates and handles errors for: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(getValue(evaluated)).toBe(expected);
    });
  });
});

describe('when evaluating stdlib:head', () => {
  describe('when valid', () => {
    test.each([
      ['head([])', null],
      ['head([1, 2, 3])', 1],
      ['head([true, true, true])', true],
      ['head(["foo", "bar", "baz"])', 'foo'],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(getValue(evaluated)).toBe(expected);
    });
  });

  describe('when invalid', () => {
    test.each([
      ['head(1)', 'TypeError: `head` expects an array, got INTEGER'],
      ['head(1 + 2)', 'TypeError: `head` expects an array, got INTEGER'],
      ['head(true)', 'TypeError: `head` expects an array, got BOOLEAN'],
      ['head(fn(x) {})', 'TypeError: `head` expects an array, got FUNCTION'],
      [
        'head(if (true) { 1 })',
        'TypeError: `head` expects an array, got INTEGER',
      ],
      ['head()', 'Wrong number of arguments. Expected 1, got 0'],
      [
        'head(["hello"], "world")',
        'Wrong number of arguments. Expected 1, got 2',
      ],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(getValue(evaluated)).toBe(expected);
    });
  });
});

describe('when evaluating stdlib:tail', () => {
  describe('when valid', () => {
    test.each([
      ['tail([])', null],
      ['tail([1, 2, 3])', [2, 3]],
      ['tail([false, true, true])', [true, true]],
      ['tail(["foo", "bar", "baz"])', ['bar', 'baz']],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(getValue(evaluated)).toEqual(expected);
    });
  });

  describe('when invalid', () => {
    test.each([
      ['tail(1)', 'TypeError: `tail` expects an array, got INTEGER'],
      ['tail(1 + 2)', 'TypeError: `tail` expects an array, got INTEGER'],
      ['tail(true)', 'TypeError: `tail` expects an array, got BOOLEAN'],
      ['tail(fn(x) {})', 'TypeError: `tail` expects an array, got FUNCTION'],
      [
        'tail(if (true) { 1 })',
        'TypeError: `tail` expects an array, got INTEGER',
      ],
      ['tail()', 'Wrong number of arguments. Expected 1, got 0'],
      [
        'tail(["hello"], "world")',
        'Wrong number of arguments. Expected 1, got 2',
      ],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(getValue(evaluated)).toBe(expected);
    });
  });
});

describe('when evaluating stdlib:last', () => {
  describe('when it returns a value', () => {
    test.each([
      ['last([])', null],
      ['last([1, 2, 3])', 3],
      ['last([false, true, true])', true],
      ['last(["foo", "bar", "baz"])', 'baz'],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(getValue(evaluated)).toEqual(expected);
    });
  });

  describe('when invalid', () => {
    test.each([
      ['last(1)', 'TypeError: `last` expects an array, got INTEGER'],
      ['last(1 + 2)', 'TypeError: `last` expects an array, got INTEGER'],
      ['last(true)', 'TypeError: `last` expects an array, got BOOLEAN'],
      ['last(fn(x) {})', 'TypeError: `last` expects an array, got FUNCTION'],
      [
        'last(if (true) { 1 })',
        'TypeError: `last` expects an array, got INTEGER',
      ],
      ['last()', 'Wrong number of arguments. Expected 1, got 0'],
      [
        'last(["hello"], "world")',
        'Wrong number of arguments. Expected 1, got 2',
      ],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(getValue(evaluated)).toBe(expected);
    });
  });
});

describe('when evaluating stdlib:push', () => {
  describe('when it returns a value', () => {
    test.each([
      ['push([], 1)', 1],
      ['push([1, 2, 3], 4)', [1, 2, 3, 4]],
      ['push([false, true, true], false)', [false, true, true, false]],
      ['push(["foo", "bar", "baz"], "qux")', ['foo', 'bar', 'baz', 'qux']],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(getValue(evaluated)).toEqual(expected);
    });
  });

  describe('when mutating arrays', () => {
    test.each([['let a = []; let b = a; push(b, 1); [a, b];', [1, 1]]])(
      'it evaluates: %p',
      (input, expected) => {
        const evaluated = testEval(input);
        expect(getValue(evaluated)).toEqual(expected);
      }
    );
  });

  describe('when invalid', () => {
    test.each([
      [
        'push(1, 1)',
        'TypeError: `push` expects an array and value, got INTEGER and INTEGER',
      ],
      [
        'push(1 + 2, 2)',
        'TypeError: `push` expects an array and value, got INTEGER and INTEGER',
      ],
      [
        'push(true, false)',
        'TypeError: `push` expects an array and value, got BOOLEAN and BOOLEAN',
      ],
      [
        'push(fn(x) {}, if (true) { 1 })',
        'TypeError: `push` expects an array and value, got FUNCTION and INTEGER',
      ],
      ['push()', 'Wrong number of arguments. Expected 2, got 0'],
      [
        'push([], "world", "peace")',
        'Wrong number of arguments. Expected 2, got 3',
      ],
    ])('it evaluates: %p', (input, expected) => {
      const evaluated = testEval(input);
      expect(getValue(evaluated)).toBe(expected);
    });
  });
});

describe('when evaluating array expressions', () => {
  describe('when evaluating array literals', () => {
    test.each([
      ['[1, 2 * 2, 3 / 3]', 3, [1, 4, 1]],
      ['[true == true, if (true) { 1 }, fn(x) { x }(2)]', 3, [true, 1, 2]],
    ])('it evaluates: %p', (input, expectedLength, expectedValues) => {
      const evaluated = testEval(input) as InternalArray;
      expect(evaluated).toBeInstanceOf(InternalArray);
      expect(evaluated.elements.length).toBe(expectedLength);
      expect(getValue(evaluated)).toEqual(expectedValues);
    });
  });

  describe('when evaluating array index expressions', () => {
    describe('when the index is in bounds', () => {
      test.each([
        ['[1, 2, 3][0]', 1],
        ['[1, 2, 3][1]', 2],
        ['[1, 2, 3][2]', 3],
        ['let i = 0; [1, 2, 3][i]', 1],
        ['[1, 2, 3][1 + 1]', 3],
        ['let list = [1, 2, 3]; list[2]', 3],
        ['let list = [1, 2, 3]; list[0] + list[1] + list[2]', 6],
        ['let list = [1, 2, 3]; let i = list[0]; list[i]', 2],
        ['let list = [fn(x) { x }(1)]; list[0]', 1],
      ])('it evaluates: %p', (input, expected) => {
        const evaluated = testEval(input);
        expect(getValue(evaluated)).toBe(expected);
      });
    });

    describe('when the index out of bounds', () => {
      test.each([
        ['[1, 2, 3][3]', null],
        ['[1, 2, 3][-1]', null],
      ])('it evaluates: %p', (input, expected) => {
        const evaluated = testEval(input);
        expect(getValue(evaluated)).toBe(expected);
      });
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
    expect(getValue(evaluated)).toBe(expected);
  });
});
