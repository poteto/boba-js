import Lexer from '../lexer';
import { Token, TokenType } from '../token';
import {
  Program,
  Statement,
  Expression,
  Identifier,
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
  BlockStatement,
} from '../ast';

import parseBoolean from './prefix/parse-boolean';
import parseIntegerLiteral from './prefix/parse-integer-literal';
import parseIdentifier from './prefix/parse-identifier';
import parseIfExpression from './prefix/parse-if-expression';
import parseInfixExpression from './infix/parse-infix-expression';
import parsePrefixExpression from './prefix/parse-prefix-expression';
import parseGroupedExpression from './prefix/parse-grouped-expression';
import parseFunctionLiteral from './prefix/parse-function-literal';
import parseCallExpression from './infix/parse-call-expression';

import assertTokenType from '../utils/assert-token-type';
import assertNonNullable from '../utils/assert-non-nullable';
import parseStringLiteral from './prefix/parse-string-literal';
import parseArrayLiteral from './prefix/parse-array-literal';
import parseIndexExpression from './infix/parse-index-expression';
import { Maybe } from '../utils/maybe';
import parseHashLiteral from './prefix/parse-hash-literal';
import hasOwnProperty from '../utils/has-own-property';

type PrefixParseFunction = () => Expression | null;
type InfixParseFunction = (expr: Expression) => Expression | null;

type PrefixParseFunctionMap = {
  [key in TokenType]: PrefixParseFunction;
};
type InfixParseFunctionMap = {
  [key in TokenType]: InfixParseFunction;
};

type SupportedPrecedenceTokens =
  | TokenType.EQ
  | TokenType.NOT_EQ
  | TokenType.LT
  | TokenType.GT
  | TokenType.PLUS
  | TokenType.MINUS
  | TokenType.SLASH
  | TokenType.ASTERISK
  | TokenType.LPAREN
  | TokenType.LBRACKET;
type PrecedenceMap = {
  [key in SupportedPrecedenceTokens]: PrecedenceOrder;
};

export const enum PrecedenceOrder {
  LOWEST,
  EQUALS,
  LESSGREATER,
  SUM,
  PRODUCT,
  PREFIX,
  CALL,
  INDEX,
}

export default class Parser {
  public currToken!: Token;
  public peekToken!: Token;
  public errors: string[] = [];

  private prefixParseFns: Partial<PrefixParseFunctionMap> = Object.create(null);
  private infixParseFns: Partial<InfixParseFunctionMap> = Object.create(null);
  private precedences: PrecedenceMap = {
    [TokenType.EQ]: PrecedenceOrder.EQUALS,
    [TokenType.NOT_EQ]: PrecedenceOrder.EQUALS,
    [TokenType.LT]: PrecedenceOrder.LESSGREATER,
    [TokenType.GT]: PrecedenceOrder.LESSGREATER,
    [TokenType.PLUS]: PrecedenceOrder.SUM,
    [TokenType.MINUS]: PrecedenceOrder.SUM,
    [TokenType.SLASH]: PrecedenceOrder.PRODUCT,
    [TokenType.ASTERISK]: PrecedenceOrder.PRODUCT,
    [TokenType.LPAREN]: PrecedenceOrder.CALL,
    [TokenType.LBRACKET]: PrecedenceOrder.INDEX,
  } as const;

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
    this.registerPrefix(TokenType.STRING, parseStringLiteral.bind(this));
    this.registerPrefix(TokenType.LBRACKET, parseArrayLiteral.bind(this));
    this.registerPrefix(TokenType.LBRACE, parseHashLiteral.bind(this));

    this.registerInfix(TokenType.PLUS, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.MINUS, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.SLASH, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.ASTERISK, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.EQ, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.NOT_EQ, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.LT, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.GT, parseInfixExpression.bind(this));
    this.registerInfix(TokenType.LPAREN, parseCallExpression.bind(this));
    this.registerInfix(TokenType.LBRACKET, parseIndexExpression.bind(this));

    this.nextToken();
    this.nextToken();
    assertNonNullable(this.currToken);
    assertNonNullable(this.peekToken);
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

  public parseStatement(): Statement | null {
    switch (this.currToken.type) {
      case TokenType.LET:
        return this.parseLetStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  public parseLetStatement(): LetStatement | null {
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
    statement.value = this.parseExpression(PrecedenceOrder.LOWEST);

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  public parseReturnStatement(): ReturnStatement | null {
    assertTokenType(this.currToken, TokenType.RETURN);
    const statement = new ReturnStatement(this.currToken);
    this.nextToken();

    statement.returnValue = this.parseExpression(PrecedenceOrder.LOWEST);

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  public parseBlockStatement(): BlockStatement | null {
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

  public parseExpression(precedence: PrecedenceOrder): Expression | null {
    const prefixFn = this.prefixParseFns[this.currToken.type];
    if (!prefixFn) {
      this.pushNoPrefixParseFnError(this.currToken.type);
      return null;
    }
    let leftExpr = prefixFn();

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

  public parseExpressionStatement(): ExpressionStatement | null {
    const statement = new ExpressionStatement(
      this.currToken,
      this.parseExpression(PrecedenceOrder.LOWEST)
    );

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  public parseFunctionParameters(): Identifier[] | null {
    const identifiers: Identifier[] = [];

    // no parameters
    if (this.peekTokenIs(TokenType.RPAREN)) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();
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

  public parseExpressionList(
    closingToken: TokenType.RPAREN | TokenType.RBRACKET
  ): Maybe<Expression[]> {
    const args: Expression[] = [];

    // no args
    if (this.peekTokenIs(closingToken)) {
      this.nextToken();
      return args;
    }

    this.nextToken();
    // first arg
    const firstArg = this.parseExpression(PrecedenceOrder.LOWEST);
    if (firstArg) {
      args.push(firstArg);
    }

    // rest of the args
    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken();
      this.nextToken();
      const arg = this.parseExpression(PrecedenceOrder.LOWEST);
      if (arg) {
        args.push(arg);
      }
    }

    if (!this.expectPeek(closingToken)) {
      return null;
    }

    return args;
  }

  public peekPrecedence(): PrecedenceOrder {
    if (this.hasPrecedence(this.peekToken.type)) {
      return this.precedences[this.peekToken.type];
    }
    return PrecedenceOrder.LOWEST;
  }

  public currPrecedence(): PrecedenceOrder {
    if (this.hasPrecedence(this.currToken.type)) {
      return this.precedences[this.currToken.type];
    }
    return PrecedenceOrder.LOWEST;
  }

  public hasPrecedence(
    tokenType: TokenType
  ): tokenType is SupportedPrecedenceTokens {
    return hasOwnProperty(this.precedences, tokenType);
  }

  public peekTokenIs(tokenType: TokenType): boolean {
    return this.peekToken.type === tokenType;
  }

  public currTokenIs(tokenType: TokenType): boolean {
    return this.currToken.type === tokenType;
  }

  public expectPeek(tokenType: TokenType): boolean {
    if (this.peekTokenIs(tokenType)) {
      this.nextToken();
      return true;
    }
    this.pushTokenTypeError(tokenType);
    return false;
  }

  private registerPrefix(tokenType: TokenType, fn: PrefixParseFunction): void {
    this.prefixParseFns[tokenType] = fn;
  }

  private registerInfix(tokenType: TokenType, fn: InfixParseFunction): void {
    this.infixParseFns[tokenType] = fn;
  }

  private pushTokenTypeError(tokenType: TokenType): void {
    this.errors.push(
      `Expected next token to be \`${tokenType}\`, got \`${this.peekToken.type}\` instead`
    );
  }

  private pushNoPrefixParseFnError(tokenType: TokenType): void {
    this.errors.push(`No prefix parse function for ${tokenType} found`);
  }
}
