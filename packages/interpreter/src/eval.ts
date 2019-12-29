import {
  ASTNode,
  IntegerLiteral,
  Program,
  ExpressionStatement,
  Statement,
  BooleanLiteral,
  PrefixExpression,
  InfixExpression,
} from './ast';
import {
  InternalObject,
  InternalInteger,
  InternalBoolean,
  InternalNull,
} from './object';

const NULL = new InternalNull();
const TRUE = new InternalBoolean(true);
const FALSE = new InternalBoolean(false);

function lookupBooleanConstant(input: boolean): InternalBoolean {
  return input ? TRUE : FALSE;
}

function evaluateStatements(statements: Statement[]): InternalObject | null {
  let result: InternalObject | null = null;
  statements.forEach(statement => {
    result = evaluate(statement);
  });
  return result;
}

function evaluateBangOperatorExpression(
  right: InternalObject | null
): InternalObject {
  switch (right) {
    case TRUE:
      return FALSE;
    case FALSE:
      return TRUE;
    case NULL:
      return TRUE;
    default:
      return FALSE;
  }
}

function evaluateMinusPrefixOperatorExpression(
  right: InternalObject | null
): InternalObject {
  if (!(right instanceof InternalInteger)) {
    return NULL;
  }
  return new InternalInteger(-right.value);
}

function evaluateIntegerInfixExpression(
  operator: string,
  left: InternalInteger | null,
  right: InternalInteger | null
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
      return NULL;
  }
}

function evaluatePrefixExpression(
  operator: string,
  right: InternalObject | null
): InternalObject {
  switch (operator) {
    case '!':
      return evaluateBangOperatorExpression(right);
    case '-':
      return evaluateMinusPrefixOperatorExpression(right);
    default:
      // TODO come back to this later
      return NULL;
  }
}

function evaluateInfixExpression(
  operator: string,
  left: InternalObject | null,
  right: InternalObject | null
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
  return NULL;
}

export default function evaluate(node: ASTNode | null): InternalObject | null {
  if (node === null) {
    throw new Error('got null');
  }
  if (node instanceof Program) {
    return evaluateStatements(node.statements);
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
    return evaluatePrefixExpression(node.operator, right);
  }
  if (node instanceof InfixExpression) {
    const left = evaluate(node.left);
    const right = evaluate(node.right);
    return evaluateInfixExpression(node.operator, left, right);
  }
  console.error('Unhandled node type -', node.toString(), node);
  return null;
}
