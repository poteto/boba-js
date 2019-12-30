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
} from '../ast';
import {
  InternalObject,
  InternalInteger,
  InternalBoolean,
  InternalNull,
  InternalReturnValue,
  InternalError,
  InternalObjectType,
  createError,
} from './internal-objects';
import { Maybe } from '../utils/maybe';

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

function isError(obj: Maybe<InternalObject>): boolean {
  return obj !== null ? obj.type === InternalObjectType.ERROR_OBJ : false;
}

function evaluateProgram(program: Program): Maybe<InternalObject> {
  let result: Maybe<InternalObject> = null;
  for (const statement of program.statements) {
    result = evaluate(statement);
    if (result instanceof InternalReturnValue) {
      return result.value;
    }
    if (result instanceof InternalError) {
      return result;
    }
  }
  return result;
}

function evaluateBlockStatement(block: BlockStatement): Maybe<InternalObject> {
  let result: Maybe<InternalObject> = null;
  for (const statement of block.statements) {
    result = evaluate(statement);
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
  right: Maybe<InternalObject>
): InternalObject {
  switch (operator) {
    case '!':
      return evaluateBangOperatorExpression(right);
    case '-':
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
  if (operator === '==') {
    return lookupBooleanConstant(left === right);
  }
  if (operator === '!=') {
    return lookupBooleanConstant(left !== right);
  }
  if (left?.type !== right?.type) {
    return createError('TypeError: ', left?.type, operator, right?.type);
  }
  return createError(
    'UnknownOperator: ',
    left?.type,
    operator,
    right?.type
  );
}

function evaluateIfExpression(expr: IfExpression): Maybe<InternalObject> {
  const condition = evaluate(expr.condition);
  if (isError(condition)) {
    return condition;
  }
  if (isTruthy(condition)) {
    return evaluate(expr.consequence);
  } else if (expr.alternative !== null) {
    return evaluate(expr.alternative);
  } else {
    return INTERNAL_NULL;
  }
}

export default function evaluate(node: Maybe<ASTNode>): Maybe<InternalObject> {
  if (node instanceof Program) {
    return evaluateProgram(node);
  }
  if (node instanceof ExpressionStatement) {
    return evaluate(node.expression);
  }
  if (node instanceof IntegerLiteral) {
    return new InternalInteger(node.value);
  }
  if (node instanceof BooleanLiteral) {
    return lookupBooleanConstant(node.value);
  }
  if (node instanceof PrefixExpression) {
    const right = evaluate(node.right);
    if (isError(right)) {
      return right;
    }
    return evaluatePrefixExpression(node.operator, right);
  }
  if (node instanceof InfixExpression) {
    const left = evaluate(node.left);
    if (isError(left)) {
      return left;
    }
    const right = evaluate(node.right);
    if (isError(right)) {
      return right;
    }
    return evaluateInfixExpression(node.operator, left, right);
  }
  if (node instanceof BlockStatement) {
    return evaluateBlockStatement(node);
  }
  if (node instanceof IfExpression) {
    return evaluateIfExpression(node);
  }
  if (node instanceof ReturnStatement) {
    const value = evaluate(node.returnValue);
    if (isError(value)) {
      return value;
    }
    if (value !== null) {
      return new InternalReturnValue(value);
    }
  }
  if (node === null) {
    throw new Error('Was not expecting node to be null');
  }
  throw new Error(`Unhandled node type - ${node.toString()}`);
}
