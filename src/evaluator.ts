import { Expr } from './parser';

export type Env = { [key: string]: any };

// 型ガードの再定義
function isLetExpr(
  expr: Expr
): expr is { type: 'let'; name: string; value: Expr } {
  return (
    typeof expr === 'object' && expr !== null && (expr as any).type === 'let'
  );
}

function isCallExpr(
  expr: Expr
): expr is { type: 'call'; name: string; args: Expr[] } {
  return (
    typeof expr === 'object' && expr !== null && (expr as any).type === 'call'
  );
}

function isFunctionExpr(
  expr: Expr
): expr is { type: 'function'; params: string[]; body: Expr } {
  return (
    typeof expr === 'object' &&
    expr !== null &&
    (expr as any).type === 'function'
  );
}

function isStatementsExpr(
  expr: Expr
): expr is { type: 'statements'; body: Expr[] } {
  return (
    typeof expr === 'object' &&
    expr !== null &&
    (expr as any).type === 'statements'
  );
}

function isOpExpr(expr: Expr): expr is { op: string; left: Expr; right: Expr } {
  return typeof expr === 'object' && expr !== null && 'op' in expr;
}

export function evaluate(expr: Expr, env: Env = {}): any {
  try {
    if (Array.isArray(expr)) {
      let result;
      for (const e of expr) {
        result = evaluate(e, env); // 各文を順に評価
      }
      return result; // 最後の式の結果を返す
    }

    // 文のリスト（statements）を評価
    if (isStatementsExpr(expr)) {
      let result;
      for (const e of expr.body) {
        result = evaluate(e, env); // 各文を順に評価
      }
      return result; // 最後の文の評価結果を返す
    }

    // 変数定義の評価
    if (isLetExpr(expr)) {
      if (isFunctionExpr(expr.value)) {
        env[expr.name] = expr.value; // 環境に関数オブジェクトを保存
      } else {
        // その他の変数や式の評価結果を保存
        const value = evaluate(expr.value, env);
        env[expr.name] = value; // 環境に変数を保存
      }
      return env[expr.name];
    }

    // 関数呼び出しの評価
    if (isCallExpr(expr)) {
      const func = env[expr.name];
      if (func && isFunctionExpr(func)) {
        const newEnv = { ...env }; // 新しい環境を作成して引数を評価
        func.params.forEach((param: string, index: number) => {
          newEnv[param] = evaluate(expr.args[index], env); // 引数を評価して新しい環境に格納
        });
        return evaluate(func.body, newEnv); // 関数本体を新しい環境で評価
      }
      throw new Error(`Undefined function: ${expr.name}`);
    }

    // 演算式（op）の評価
    if (isOpExpr(expr)) {
      const left = evaluate(expr.left, env);
      const right = evaluate(expr.right, env);
      switch (expr.op) {
        case '+':
          return left + right;
        case '-':
          return left - right;
        case '*':
          return left * right;
        case '/':
          return left / right;
      }
    }

    // 数値の場合
    if (typeof expr === 'number') {
      return expr;
    }

    // 変数の評価
    if (typeof expr === 'string') {
      if (env[expr] !== undefined) {
        return env[expr]; // 環境から変数を評価
      }
      throw new Error(`Undefined variable: ${expr}`);
    }

    throw new Error(`Unknown expression`);
  } catch (error) {
    console.error(`Error in expression: ${JSON.stringify(expr, null, 2)}`);
    throw error;
  }
}
