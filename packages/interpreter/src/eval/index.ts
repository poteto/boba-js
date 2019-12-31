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
} from '../ast';
import {
  Environment,
  InternalObject,
  InternalInteger,
  InternalBoolean,
  InternalNull,
  InternalReturnValue,
  InternalError,
  InternalObjectType,
  createError,
  InternalFunction,
} from './internal-objects';
import { Maybe } from '../utils/maybe';
import { ArgumentError, isArgumentError } from './internal-objects/internal-error';

const INTERNAL_NULL = new InternalNull();
const INTERNAL_TRUE = new InternalBoolean(true);
const INTERNAL_FALSE = new InternalBoolean(false);

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
  right: Maybe<InternalObject>,
  env: Environment
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
  right: Maybe<InternalObject>,
  env: Environment
): InternalObject {
  if (!(right instanceof InternalInteger)) {
    return createError('UnknownOperator: -', right?.type);
  }
  return new InternalInteger(-right.value);
}

function evaluateIntegerInfixExpression(
  operator: string,
  left: Maybe<InternalInteger>,
  right: Maybe<InternalInteger>,
  env: Environment
): InternalObject {
  const leftValue = left?.value;
  const rightValue = right?.value;

  if (!leftValue || !rightValue) {
    throw new Error(
      'Cannot evaluate integer infix expression where left or right is null'
    );
  }

  switch (operator) {
    case '+':
      return new InternalInteger(leftValue + rightValue);
    case '-':
      return new InternalInteger(leftValue - rightValue);
    case '*':
      return new InternalInteger(leftValue * rightValue);
    case '/':
      return new InternalInteger(leftValue / rightValue);
    case '<':
      return lookupBooleanConstant(leftValue < rightValue);
    case '>':
      return lookupBooleanConstant(leftValue > rightValue);
    case '==':
      return lookupBooleanConstant(leftValue === rightValue);
    case '!=':
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

function evaluatePrefixExpression(
  operator: string,
  right: Maybe<InternalObject>,
  env: Environment
): InternalObject {
  switch (operator) {
    case '!':
      return evaluateBangOperatorExpression(right, env);
    case '-':
      return evaluateMinusPrefixOperatorExpression(right, env);
    default:
      return createError('UnknownOperator: ', operator, right?.type);
  }
}

function evaluateInfixExpression(
  operator: string,
  left: Maybe<InternalObject>,
  right: Maybe<InternalObject>,
  env: Environment
): InternalObject {
  if (left instanceof InternalInteger && right instanceof InternalInteger) {
    return evaluateIntegerInfixExpression(operator, left, right, env);
  }
  if (operator === '==') {
    return lookupBooleanConstant(left === right);
  }
  if (operator === '!=') {
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
  if (fn === null) {
    throw new Error('fn is null in applyFunction');
  }
  if (!(fn instanceof InternalFunction)) {
    return createError('TypeError: ', `${fn.type} is not a function`);
  }
  const extendedEnv = extendFunctionEnvironment(fn, args);
  const evaluated = evaluate(fn.body, extendedEnv);
  return unwrapReturnValue(evaluated);
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

function unwrapReturnValue(obj: Maybe<InternalObject>): Maybe<InternalObject> {
  if (obj instanceof InternalReturnValue) {
    return obj.value;
  }
  return obj;
}

export default function evaluate(
  node: Maybe<ASTNode>,
  env: Environment
): Maybe<InternalObject> {
  if (node instanceof Program) {
    return evaluateProgram(node, env);
  }
  if (node instanceof ExpressionStatement) {
    return evaluate(node.expression, env);
  }
  if (node instanceof IntegerLiteral) {
    return new InternalInteger(node.value);
  }
  if (node instanceof BooleanLiteral) {
    return lookupBooleanConstant(node.value);
  }
  if (node instanceof PrefixExpression) {
    const right = evaluate(node.right, env);
    if (isError(right)) {
      return right;
    }
    return evaluatePrefixExpression(node.operator, right, env);
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
    return evaluateInfixExpression(node.operator, left, right, env);
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
    if (node.body !== null && node.parameters !== null) {
      return new InternalFunction(env, node.body, node.parameters);
    }
    throw new Error('Function body and parameters were null');
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
  }
  if (node === null) {
    throw new Error('Was not expecting node to be null');
  }
  throw new Error(`Unhandled node type - ${node}`);
}
