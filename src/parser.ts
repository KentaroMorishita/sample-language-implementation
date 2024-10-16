import { Token } from './tokenizer';
import { useQueue } from './helpers/useQueue';

export type Expr =
  | { type: 'operator'; op: string; left: Expr; right: Expr }
  | { type: 'literal'; value: string | number }
  | { type: 'identifier'; name: string }
  | { type: 'let'; name: string; value: Expr }
  | { type: 'fn'; params: string[]; body: Expr }
  | { type: 'call'; name: string; args: Expr[] }
  | { type: 'statements'; body: Expr[] };

export function parse(tokens: Token[]): Expr {
  const { advance, peek, hasMore } = useQueue<Token>(tokens);

  function expect(value: string) {
    const token = peek();
    if (token.value !== value) {
      throw new Error(`Expected "${value}", but found "${token.value}"`);
    }
    advance();
  }

  function parseStatements(): Expr {
    const statements: Expr[] = [];
    while (hasMore()) {
      // トークンが残っている間は処理を続ける
      const expr = parseExpression();

      // 文の区切りをセミコロンまたはトークンの終わりとして扱う
      if (hasMore()) {
        const nextToken = peek();
        if (nextToken.type === 'punctuation' && nextToken.value === ';') {
          advance(); // セミコロンを消費する
        }
      }

      statements.push(expr);
    }

    return { type: 'statements', body: statements };
  }

  function parseExpression(): Expr {
    const token = peek();

    if (token.type === 'keyword' && token.value === 'let') {
      return parseLet();
    }

    return parseAddSub();
  }

  function parseAddSub(): Expr {
    let left = parseMulDiv();

    while (
      hasMore() &&
      peek().type === 'operator' &&
      (peek().value === '+' || peek().value === '-')
    ) {
      const op = advance().value as string;
      const right = parseMulDiv();
      left = { type: 'operator', op, left, right };
    }

    return left;
  }

  function parseMulDiv(): Expr {
    let left = parseFactor();

    while (
      hasMore() &&
      peek().type === 'operator' &&
      (peek().value === '*' || peek().value === '/')
    ) {
      const op = advance().value as string;
      const right = parseFactor();
      left = { type: 'operator', op, left, right };
    }

    return left;
  }

  function parseFactor(): Expr {
    const token = peek();

    if (token.type === 'number') {
      advance();
      return { type: 'literal', value: token.value as number };
    } else if (token.type === 'string') {
      advance();
      return { type: 'literal', value: token.value as string };
    } else if (token.value === '(') {
      advance(); // '(' をスキップ
      const expr = parseExpression(); // 括弧内の式をパース
      expect(')');
      return expr;
    } else if (token.type === 'identifier') {
      return parseIdentifierOrCall();
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  function parseIdentifierOrCall(): Expr {
    const name = advance().value as string;

    if (hasMore() && peek().value === '(') {
      return parseCall(name);
    }

    return { type: 'identifier', name };
  }

  function parseCall(callee: string): Expr {
    expect('(');
    const args: Expr[] = [];

    let first = true;
    while (peek().value !== ')') {
      if (!first) {
        expect(',');
      }
      args.push(parseExpression());
      first = false;
    }
    expect(')');

    return { type: 'call', name: callee, args };
  }

  function parseLet(): Expr {
    advance(); // 'let' をスキップ
    const name = advance().value as string;
    expect('=');

    // 関数定義のパース
    if (peek().value === '(') {
      return parseFunction(name);
    }

    const value = parseExpression();
    return { type: 'let', name, value };
  }

  function parseFunction(name: string): Expr {
    expect('(');
    const params: string[] = [];

    let first = true;
    while (peek().value !== ')') {
      if (!first) {
        expect(',');
      }
      params.push(advance().value as string);
      first = false;
    }
    expect(')');
    expect('=>');

    const body = parseExpression();
    return { type: 'let', name, value: { type: 'fn', params, body } };
  }

  return parseStatements();
}
