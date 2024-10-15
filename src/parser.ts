export type Expr =
  | number
  | string
  | { op: string; left: Expr; right: Expr }
  | { type: 'let'; name: string; value: Expr }
  | { type: 'function'; params: string[]; body: Expr }
  | { type: 'call'; name: string; args: Expr[] }
  | { type: 'statements'; body: Expr[] };

export function parse(tokens: string[]): Expr {
  let index = 0;

  function parseStatements(): Expr {
    const statements: Expr[] = [];
    while (index < tokens.length) {
      const expr = parseExpression();
      if (tokens[index] === ';') {
        index++; // skip ';'
      }
      statements.push(expr);
    }
    return { type: 'statements', body: statements };
  }

  function parseExpression(): Expr {
    // 変数定義のパース
    if (tokens[index] === 'let') {
      index++; // skip 'let'
      const name = tokens[index++];
      index++; // skip '='

      // 関数定義のパース
      if (tokens[index] === '(') {
        const params: string[] = [];
        index++; // skip '('
        while (tokens[index] !== ')') {
          params.push(tokens[index++]); // 引数の追加
          if (tokens[index] === ',') {
            index++; // skip ','
          }
        }
        index++; // skip ')'
        index++; // skip '=>'

        // 関数本体をパース
        const body = parseExpression();
        return {
          type: 'let',
          name,
          value: { type: 'function', params, body },
        };
      }

      const value = parseExpression();
      return { type: 'let', name, value };
    }

    // 関数呼び出しのパース
    let left = parseTerm();

    if (tokens[index] === '(') {
      index++;
      const args: Expr[] = [];
      while (tokens[index] !== ')') {
        args.push(parseExpression()); // 引数をパース
        if (tokens[index] === ',') {
          index++; // skip ','
        }
      }
      index++; // skip ')'
      return { type: 'call', name: left as string, args };
    }

    while (tokens[index] === '+' || tokens[index] === '-') {
      const op = tokens[index++];
      const right = parseTerm();
      left = { op, left, right };
    }

    return left;
  }

  function parseTerm(): Expr {
    let left = parseFactor();
    while (tokens[index] === '*' || tokens[index] === '/') {
      const op = tokens[index++];
      const right = parseFactor();
      left = { op, left, right };
    }

    return left;
  }

  function parseFactor(): Expr {
    const token = tokens[index++];
    if (/\d+/.test(token)) {
      return parseInt(token, 10);
    } else if (token === '(') {
      const expr = parseExpression();
      index++; // skip ')'
      return expr;
    } else {
      return token;
    }
  }

  return parseStatements();
}
