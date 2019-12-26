import Lexer from '../lexer';
import { Token, TokenType } from '../token';
import { Statement, Expression } from '../ast';

import { assertTokenType } from '../utils/assertions';
import {
  Program,
  Identifier,
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
} from '../ast';
import parseBoolean from './prefix/parse-boolean';
import parseIntegerLiteral from './prefix/parse-integer-literal';
import parseIdentifier from './prefix/parse-identifier';
import parseIfExpression from './prefix/parse-if-expression';
import parseInfixExpression from './infix/parse-infix-expression';
import parsePrefixExpression from './prefix/parse-prefix-expression';
import parseGroupedExpression from './prefix/parse-grouped-expression';
import BlockStatement from '../ast/nodes/block-statement';
import parseFunctionLiteral from './prefix/parse-function-literal';

type PrefixParseFunction = () => Expression | null;
type InfixParseFunction = (expr: Expression) => Expression | null;

type PrefixParseFunctionMap = {
  [key in TokenType]: PrefixParseFunction;
};
type InfixParseFunctionMap = {
  [key in TokenType]: InfixParseFunction;
};
type PrecedenceMap = {
  [TokenType.EQ]: PrecedenceOrder.EQUALS;
  [TokenType.NOT_EQ]: PrecedenceOrder.EQUALS;
  [TokenType.LT]: PrecedenceOrder.LESSGREATER;
  [TokenType.GT]: PrecedenceOrder.LESSGREATER;
  [TokenType.PLUS]: PrecedenceOrder.SUM;
  [TokenType.MINUS]: PrecedenceOrder.SUM;
  [TokenType.SLASH]: PrecedenceOrder.PRODUCT;
  [TokenType.ASTERISK]: PrecedenceOrder.PRODUCT;
};
type SupportedPrecedenceTokens = keyof PrecedenceMap;

export const enum PrecedenceOrder {
  LOWEST,
  EQUALS,
  LESSGREATER,
  SUM,
  PRODUCT,
  PREFIX,
  CALL,
}

export default class Parser {
  public currToken?: Token;
  public peekToken?: Token;
  public errors: string[] = [];

  private prefixParseFns: Partial<PrefixParseFunctionMap> = {};
  private infixParseFns: Partial<InfixParseFunctionMap> = {};
  private precedences: PrecedenceMap = {
    [TokenType.EQ]: PrecedenceOrder.EQUALS,
    [TokenType.NOT_EQ]: PrecedenceOrder.EQUALS,
    [TokenType.LT]: PrecedenceOrder.LESSGREATER,
    [TokenType.GT]: PrecedenceOrder.LESSGREATER,
    [TokenType.PLUS]: PrecedenceOrder.SUM,
    [TokenType.MINUS]: PrecedenceOrder.SUM,
    [TokenType.SLASH]: PrecedenceOrder.PRODUCT,
    [TokenType.ASTERISK]: PrecedenceOrder.PRODUCT,
  };

  constructor(private lexer: Lexer) {
    this.registerPrefix(TokenType.IDENT, parseIdentifier.bind(this));
    this.registerPrefix(TokenType.INT, parseIntegerLiteral.bind(this));
    this.registerPrefix(TokenType.BANG, parsePrefixExpression.bind(this));
    this.registerPrefix(TokenType.MINUS, parsePrefixExpression.bind(this));
    this.registerPrefix(TokenType.TRUE, parseBoolean.bind(this));
    this.registerPrefix(TokenType.FALSE, parseBoolean.bind(this));
    this.registerPrefix(TokenType.LPAREN, parseGroupedExpression.bind(this));
    this.registerPrefix(TokenType.IF, parseIfExpression.bind(this));
    this.registerPrefix(TokenType.FUNCTION, parseFunctionLiteral.bind(this));

    this.registerInfix(TokenType.PLUS, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.MINUS, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.SLASH, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.ASTERISK, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.EQ, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.NOT_EQ, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.LT, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.GT, parseInfixExpression.bind(this));

    this.nextToken();
    this.nextToken();
  }

  public nextToken(): void {
    this.currToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  public parseProgram(): Program {
    const program = new Program();

    while (!this.currTokenIs(TokenType.EOF)) {
      const statement = this.parseStatement();
      if (statement !== null) {
        program.statements.push(statement);
      }
      this.nextToken();
    }

    return program;
  }

  public parseExpression(precedence: PrecedenceOrder): Expression | null {
    if (this.currToken === undefined) {
      return null;
    }
    const prefixFn = this.prefixParseFns[this.currToken.type];
    if (!prefixFn) {
      this.pushNoPrefixParseFnError(this.currToken.type);
      return null;
    }
    let leftExpr = prefixFn();

    if (this.peekToken === undefined) {
      return null;
    }

    while (
      !this.peekTokenIs(TokenType.SEMICOLON) &&
      precedence < this.peekPrecedence()
    ) {
      const infixFn = this.infixParseFns[this.peekToken.type];
      if (!infixFn) {
        return leftExpr;
      }

      this.nextToken();

      if (leftExpr) {
        leftExpr = infixFn(leftExpr);
      }
    }

    return leftExpr;
  }

  public currPrecedence(): PrecedenceOrder {
    let defaultPrecedence = PrecedenceOrder.LOWEST;
    if (this.currToken === undefined) {
      return defaultPrecedence;
    }
    if (this.hasPrecedence(this.currToken.type)) {
      return this.precedences[this.currToken.type] as PrecedenceOrder;
    }
    return defaultPrecedence;
  }

  public currTokenIs(tokenType: TokenType): boolean {
    return this.currToken?.type === tokenType;
  }

  public peekTokenIs(tokenType: TokenType): boolean {
    return this.peekToken?.type === tokenType;
  }

  public expectPeek(tokenType: TokenType): boolean {
    if (this.peekTokenIs(tokenType)) {
      this.nextToken();
      return true;
    }
    this.pushTokenTypeError(tokenType);
    return false;
  }

  public parseBlockStatement(): BlockStatement | null {
    if (this.currToken === undefined) {
      return null;
    }
    assertTokenType(this.currToken, TokenType.LBRACE);
    const block = new BlockStatement(this.currToken);
    this.nextToken();

    while (
      !this.currTokenIs(TokenType.RBRACE) &&
      !this.currTokenIs(TokenType.EOF)
    ) {
      const statement = this.parseStatement();
      if (statement !== null) {
        block.statements.push(statement);
      }
      this.nextToken();
    }

    return block;
  }

  public parseFunctionParameters(): Identifier[] | null {
    const identifiers: Identifier[] = [];

    // no parameters
    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();
    if (this.currToken === undefined) {
      return null;
    }
    assertTokenType(this.currToken, TokenType.IDENT);
    // first parameter
    identifiers.push(new Identifier(this.currToken, this.currToken.literal));

    // rest of the parameters
    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken();
      this.nextToken();
      identifiers.push(new Identifier(this.currToken, this.currToken.literal));
    }

    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    return identifiers;
  }

  private parseStatement(): Statement | null {
    if (this.currToken === undefined) {
      return null;
    }
    switch (this.currToken.type) {
      case TokenType.LET:
        return this.parseLetStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): LetStatement | null {
    if (this.currToken === undefined) {
      return null;
    }
    assertTokenType(this.currToken, TokenType.LET);
    const statement = new LetStatement(this.currToken);

    if (!this.expectPeek(TokenType.IDENT)) {
      return null;
    }
    assertTokenType(this.currToken, TokenType.IDENT);

    statement.name = new Identifier(this.currToken, this.currToken.literal);

    if (!this.expectPeek(TokenType.ASSIGN)) {
      return null;
    }

    this.nextToken();
    const value = this.parseExpression(PrecedenceOrder.LOWEST);
    if (value) {
      statement.value = value;
    }

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  private parseReturnStatement(): ReturnStatement | null {
    if (this.currToken === undefined) {
      return null;
    }
    assertTokenType(this.currToken, TokenType.RETURN);
    const statement = new ReturnStatement(this.currToken);
    this.nextToken();

    const returnValue = this.parseExpression(PrecedenceOrder.LOWEST);
    if (returnValue) {
      statement.returnValue = returnValue;
    }

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  private parseExpressionStatement(): ExpressionStatement | null {
    if (this.currToken === undefined) {
      return null;
    }
    const statement = new ExpressionStatement(this.currToken);
    const expression = this.parseExpression(PrecedenceOrder.LOWEST);

    if (expression) {
      statement.expression = expression;
    }

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  private registerPrefix(tokenType: TokenType, fn: PrefixParseFunction): void {
    this.prefixParseFns[tokenType] = fn;
  }

  private registerInfix(tokenType: TokenType, fn: InfixParseFunction): void {
    this.infixParseFns[tokenType] = fn;
  }

  private peekPrecedence(): PrecedenceOrder {
    const defaultPrecedence = PrecedenceOrder.LOWEST;
    if (this.peekToken === undefined) {
      return defaultPrecedence;
    }
    if (this.hasPrecedence(this.peekToken.type)) {
      return this.precedences[this.peekToken.type] as PrecedenceOrder;
    }
    return defaultPrecedence;
  }

  private pushTokenTypeError(tokenType: TokenType): void {
    this.errors.push(
      `Expected next token to be \`${tokenType}\`, got \`${this.peekToken?.type}\` instead`
    );
  }

  private pushNoPrefixParseFnError(tokenType: TokenType): void {
    this.errors.push(`No prefix parse function for ${tokenType} found`);
  }

  private hasPrecedence(
    tokenType: TokenType
  ): tokenType is SupportedPrecedenceTokens {
    if (tokenType === undefined) {
      return false;
    }
    return this.precedences.hasOwnProperty(tokenType);
  }
}
