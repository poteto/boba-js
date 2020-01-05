import { TokenType } from '../token';
import stdlib from './stdlib';
import {
  ASTNode,
  IntegerLiteral,
  Program,
  ExpressionStatement,
  BooleanLiteral,
  PrefixExpression,
  InfixExpression,
  IfExpression,
  BlockStatement,
  ReturnStatement,
  LetStatement,
  Identifier,
  CallExpression,
  Expression,
  FunctionLiteral,
  StringLiteral,
  ArrayLiteral,
  IndexExpression,
} from '../ast';
import {
  Environment,
  InternalObject,
  InternalInteger,
  InternalBoolean,
  InternalReturnValue,
  InternalError,
  InternalObjectType,
  createError,
  InternalFunction,
  InternalString,
  InternalArray,
  StandardLibraryObject,
  HashableInternalObject,
} from './internal-objects';
import { Maybe } from '../utils/maybe';
import {
  ArgumentError,
  isArgumentError,
} from './internal-objects/internal-error';
import { INTERNAL_NULL } from './internal-objects/internal-null';
import {
  INTERNAL_TRUE,
  INTERNAL_FALSE,
} from './internal-objects/internal-boolean';

import assertNonNullable from '../utils/assert-non-nullable';
import hasOwnProperty from '../utils/has-own-property';
import HashLiteral from '../ast/nodes/hash-literal';
import isHashableInternalObject from '../utils/is-hashable-internal-object';
import InternalHash from './internal-objects/internal-hash';

const MIN_ARRAY_INDEX = 0;

function lookupBooleanConstant(input: boolean): InternalBoolean {
  return input ? INTERNAL_TRUE : INTERNAL_FALSE;
}

function isTruthy(obj: Maybe<InternalObject>): boolean {
  switch (obj) {
    case INTERNAL_NULL:
    case INTERNAL_FALSE:
      return false;
    case INTERNAL_TRUE:
    default:
      return true;
  }
}

function isError(obj: Maybe<InternalObject>): obj is InternalError {
  return obj !== null ? obj.type === InternalObjectType.ERROR_OBJ : false;
}

function evaluateProgram(
  program: Program,
  env: Environment
): Maybe<InternalObject> {
  let result: Maybe<InternalObject> = null;
  for (const statement of program.statements) {
    result = evaluate(statement, env);
    if (result instanceof InternalReturnValue) {
      return result.value;
    }
    if (result instanceof InternalError) {
      return result;
    }
  }
  return result;
}

function evaluateBlockStatement(
  block: BlockStatement,
  env: Environment
): Maybe<InternalObject> {
  let result: Maybe<InternalObject> = null;
  for (const statement of block.statements) {
    result = evaluate(statement, env);
    if (result !== null) {
      if (
        result instanceof InternalReturnValue ||
        result instanceof InternalError
      ) {
        return result;
      }
    }
  }
  return result;
}

function evaluateBangOperatorExpression(
  right: Maybe<InternalObject>
): InternalObject {
  switch (right) {
    case INTERNAL_FALSE:
    case INTERNAL_NULL:
      return INTERNAL_TRUE;
    case INTERNAL_TRUE:
    default:
      return INTERNAL_FALSE;
  }
}

function evaluateMinusPrefixOperatorExpression(
  right: Maybe<InternalObject>
): InternalObject {
  if (!(right instanceof InternalInteger)) {
    return createError('UnknownOperator: -', right?.type);
  }
  return new InternalInteger(-right.value);
}

function evaluateIntegerInfixExpression(
  operator: string,
  left: Maybe<InternalInteger>,
  right: Maybe<InternalInteger>
): InternalObject {
  assertNonNullable(left);
  assertNonNullable(right);

  const leftValue = left.value;
  const rightValue = right.value;

  switch (operator) {
    case TokenType.PLUS:
      return new InternalInteger(leftValue + rightValue);
    case TokenType.MINUS:
      return new InternalInteger(leftValue - rightValue);
    case TokenType.ASTERISK:
      return new InternalInteger(leftValue * rightValue);
    case TokenType.SLASH:
      return new InternalInteger(leftValue / rightValue);
    case TokenType.LT:
      return lookupBooleanConstant(leftValue < rightValue);
    case TokenType.GT:
      return lookupBooleanConstant(leftValue > rightValue);
    case TokenType.EQ:
      return lookupBooleanConstant(leftValue === rightValue);
    case TokenType.NOT_EQ:
      return lookupBooleanConstant(leftValue !== rightValue);
    default:
      return createError(
        'UnknownOperator: ',
        left?.type,
        operator,
        right?.type
      );
  }
}

function evaluateStringInfixExpression(
  operator: string,
  left: Maybe<InternalString>,
  right: Maybe<InternalString>
): InternalObject {
  assertNonNullable(left);
  assertNonNullable(right);
  if (operator === TokenType.PLUS) {
    const leftValue = left.value;
    const rightValue = right.value;
    return new InternalString(leftValue + rightValue);
  }
  return createError('UnknownOperator: ', left?.type, operator, right?.type);
}

function evaluatePrefixExpression(
  operator: string,
  right: Maybe<InternalObject>
): InternalObject {
  switch (operator) {
    case TokenType.BANG:
      return evaluateBangOperatorExpression(right);
    case TokenType.MINUS:
      return evaluateMinusPrefixOperatorExpression(right);
    default:
      return createError('UnknownOperator: ', operator, right?.type);
  }
}

function evaluateInfixExpression(
  operator: string,
  left: Maybe<InternalObject>,
  right: Maybe<InternalObject>
): InternalObject {
  if (left instanceof InternalInteger && right instanceof InternalInteger) {
    return evaluateIntegerInfixExpression(operator, left, right);
  }
  if (left instanceof InternalString && right instanceof InternalString) {
    return evaluateStringInfixExpression(operator, left, right);
  }
  if (operator === TokenType.EQ) {
    return lookupBooleanConstant(left === right);
  }
  if (operator === TokenType.NOT_EQ) {
    return lookupBooleanConstant(left !== right);
  }
  if (left?.type !== right?.type) {
    return createError('TypeError: ', left?.type, operator, right?.type);
  }
  return createError('UnknownOperator: ', left?.type, operator, right?.type);
}

function evaluateIfExpression(
  expr: IfExpression,
  env: Environment
): Maybe<InternalObject> {
  const condition = evaluate(expr.condition, env);
  if (isError(condition)) {
    return condition;
  }
  if (isTruthy(condition)) {
    return evaluate(expr.consequence, env);
  } else if (expr.alternative !== null) {
    return evaluate(expr.alternative, env);
  } else {
    return INTERNAL_NULL;
  }
}

function evaluateIdentifier(
  node: Identifier,
  env: Environment
): Maybe<InternalObject> {
  if (hasOwnProperty(stdlib, node.value)) {
    return stdlib[node.value];
  }
  const value = env.get(node.value);
  if (value === null) {
    return createError('ReferenceError: ', `${node.value} is not defined`);
  }
  return value;
}

function evaluateExpressions(
  exprs: Expression[],
  env: Environment
): ArgumentError | Maybe<InternalObject>[] {
  let results: Maybe<InternalObject>[] = [];
  for (let expr of exprs) {
    const evaluated = evaluate(expr, env);
    if (isError(evaluated)) {
      return [evaluated];
    }
    results.push(evaluated);
  }
  return results;
}

function applyFunction(
  fn: Maybe<InternalObject>,
  args: Maybe<InternalObject>[]
): Maybe<InternalObject> {
  assertNonNullable(fn);
  if (fn instanceof StandardLibraryObject) {
    return fn.fn(...args);
  }
  if (fn instanceof InternalFunction) {
    const extendedEnv = extendFunctionEnvironment(fn, args);
    const evaluated = evaluate(fn.body, extendedEnv);
    return unwrapReturnValue(evaluated);
  }
  return createError('TypeError: ', `${fn.type} is not a function`);
}

/**
 * `inner` is the environment that keeps track of the function literal's
 * parameters and the values that those parameters are bound to.
 *
 * For example:
 *    let add = fn(x, y) { x + y; };
 *    foo(1, 3);
 *
 *    inner: { x: 1, y: 3 };
 *
 * `outer` is the lexical scope for the function. It allows the function's
 * block statement to close over variables from outside the block scope.
 *
 * For example:
 *    let a = 5;
 *    let add = fn(x, y) { a + x + y; };
 *    foo(1, 3);
 *
 *    inner: { x: 1, y: 3 };
 *    outer: { a: 5, add: fn };
 */
function extendFunctionEnvironment(
  fn: InternalFunction,
  args: Maybe<InternalObject>[]
) {
  const inner = Environment.encloseWith(fn.env);
  for (let i = 0; i < fn.parameters.length; i++) {
    const param = fn.parameters[i];
    inner.set(param.value, args[i]);
  }
  return inner;
}

function evaluateArrayIndexExpression(
  left: InternalArray,
  index: InternalInteger
) {
  const maxIndex = left.elements.length - 1;
  if (index.value < MIN_ARRAY_INDEX || index.value > maxIndex) {
    return INTERNAL_NULL;
  }
  return left.elements[index.value];
}

function evaluateHashIndexExpression(
  left: InternalHash,
  index: HashableInternalObject
): InternalObject {
  const hashKey = index.toHashKey();
  if (hasOwnProperty(left.pairs, hashKey)) {
    return left.pairs[hashKey];
  }
  return INTERNAL_NULL;
}

function evaluateIndexExpression(
  left: Maybe<InternalObject>,
  index: Maybe<InternalObject>
): Maybe<InternalObject> {
  if (left instanceof InternalArray) {
    if (!(index instanceof InternalInteger)) {
      return createError('TypeError: index expression must be an integer');
    }
    return evaluateArrayIndexExpression(left, index);
  }
  if (left instanceof InternalHash) {
    assertNonNullable(index);
    if (!isHashableInternalObject(index)) {
      return createError(
        'TypeError: index expression must be an integer, string, or boolean'
      );
    }
    return evaluateHashIndexExpression(left, index);
  }
  return createError('TypeError: index operator not supported on ', left?.type);
}

function unwrapReturnValue(obj: Maybe<InternalObject>): Maybe<InternalObject> {
  return obj instanceof InternalReturnValue ? obj.value : obj;
}

function evaluateHashLiteral(
  node: HashLiteral,
  env: Environment
): InternalObject {
  const pairs = Object.create(null);
  for (const [keyExpr, valueExpr] of node.pairs.entries()) {
    const key = evaluate(keyExpr, env);
    if (isError(key)) {
      return key;
    }
    assertNonNullable(key);
    if (!isHashableInternalObject(key)) {
      return createError('Unusable as hash key: ', key.type);
    }
    const value = evaluate(valueExpr, env);
    if (isError(value)) {
      return value;
    }
    pairs[key.toHashKey()] = value;
  }
  return new InternalHash(pairs);
}

export default function evaluate(
  node: Maybe<ASTNode>,
  env: Environment
): Maybe<InternalObject> {
  assertNonNullable(node);
  if (node instanceof Program) {
    return evaluateProgram(node, env);
  }
  if (node instanceof ExpressionStatement) {
    return evaluate(node.expression, env);
  }
  if (node instanceof IntegerLiteral) {
    return new InternalInteger(node.value);
  }
  if (node instanceof StringLiteral) {
    return new InternalString(node.value);
  }
  if (node instanceof BooleanLiteral) {
    return lookupBooleanConstant(node.value);
  }
  if (node instanceof PrefixExpression) {
    const right = evaluate(node.right, env);
    if (isError(right)) {
      return right;
    }
    return evaluatePrefixExpression(node.operator, right);
  }
  if (node instanceof InfixExpression) {
    const left = evaluate(node.left, env);
    if (isError(left)) {
      return left;
    }
    const right = evaluate(node.right, env);
    if (isError(right)) {
      return right;
    }
    return evaluateInfixExpression(node.operator, left, right);
  }
  if (node instanceof BlockStatement) {
    return evaluateBlockStatement(node, env);
  }
  if (node instanceof IfExpression) {
    return evaluateIfExpression(node, env);
  }
  if (node instanceof ReturnStatement) {
    const value = evaluate(node.returnValue, env);
    if (isError(value)) {
      return value;
    }
    if (value !== null) {
      return new InternalReturnValue(value);
    }
    return createError(`Possible syntax error with ${node}`);
  }
  if (node instanceof LetStatement) {
    const value = evaluate(node.value, env);
    if (isError(value)) {
      return value;
    }
    if (node.name?.value) {
      env.set(node.name.value, value);
    }
    return value;
  }
  if (node instanceof Identifier) {
    return evaluateIdentifier(node, env);
  }
  if (node instanceof FunctionLiteral) {
    assertNonNullable(node.body);
    assertNonNullable(node.parameters);
    if (node.body !== null && node.parameters !== null) {
      return new InternalFunction(env, node.body, node.parameters);
    }
    return createError(`Possible syntax error with ${node}`);
  }
  if (node instanceof CallExpression) {
    const fn = evaluate(node.fn, env);
    if (isError(fn)) {
      return fn;
    }
    if (node.args !== null) {
      const args = evaluateExpressions(node.args, env);
      if (isArgumentError(args)) {
        return args[0];
      }
      return applyFunction(fn, args);
    }
    return createError(`Possible syntax error with ${node}`);
  }
  if (node instanceof ArrayLiteral) {
    const elements = evaluateExpressions(node.elements, env);
    if (isArgumentError(elements)) {
      return elements[0];
    }
    return new InternalArray(elements);
  }
  if (node instanceof IndexExpression) {
    const left = evaluate(node.left, env);
    if (isError(left)) {
      return left;
    }
    const index = evaluate(node.index, env);
    if (isError(index)) {
      return index;
    }
    return evaluateIndexExpression(left, index);
  }
  if (node instanceof HashLiteral) {
    return evaluateHashLiteral(node, env);
  }
  throw new Error(`Unhandled node type encountered while evaluating - ${node}`);
}
