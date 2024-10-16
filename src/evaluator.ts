import { Expr } from './parser';

export type Env = { [key: string]: any };

// 型ガード関数の整理
const isExprType = {
  let: (expr: Expr): expr is { type: 'let'; name: string; value: Expr } =>
    typeof expr === 'object' && expr !== null && (expr as any).type === 'let',
  call: (expr: Expr): expr is { type: 'call'; name: string; args: Expr[] } =>
    typeof expr === 'object' && expr !== null && (expr as any).type === 'call',
  fn: (expr: Expr): expr is { type: 'fn'; params: string[]; body: Expr } =>
    typeof expr === 'object' && expr !== null && (expr as any).type === 'fn',
  statements: (expr: Expr): expr is { type: 'statements'; body: Expr[] } =>
    typeof expr === 'object' &&
    expr !== null &&
    (expr as any).type === 'statements',
  op: (expr: Expr): expr is { op: string; left: Expr; right: Expr } =>
    typeof expr === 'object' && expr !== null && 'op' in expr,
};

// 各種評価関数
function evaluateLetExpr(
  expr: { type: 'let'; name: string; value: Expr },
  env: Env
): any {
  const value = isExprType.fn(expr.value)
    ? expr.value
    : evaluate(expr.value, env);
  env[expr.name] = value;
  return value;
}

function evaluateCallExpr(
  expr: { type: 'call'; name: string; args: Expr[] },
  env: Env
): any {
  const func = env[expr.name];
  if (func && isExprType.fn(func)) {
    const newEnv = { ...env };
    func.params.forEach((param, index) => {
      newEnv[param] = evaluate(expr.args[index], env);
    });
    return evaluate(func.body, newEnv);
  }
  throw new Error(`Undefined function: ${expr.name}`);
}

function evaluateOpExpr(
  expr: { op: string; left: Expr; right: Expr },
  env: Env
): any {
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
    default:
      throw new Error(`Unsupported operator: ${expr.op}`);
  }
}

// メインの評価関数
export function evaluate(expr: Expr, env: Env = {}): any {
  try {
    if (isExprType.statements(expr)) {
      return expr.body.reduce((_, e) => evaluate(e, env), undefined);
    }

    if (isExprType.let(expr)) {
      return evaluateLetExpr(expr, env);
    }

    if (isExprType.call(expr)) {
      return evaluateCallExpr(expr, env);
    }

    if (isExprType.op(expr)) {
      return evaluateOpExpr(expr, env);
    }

    if (typeof expr === 'number') {
      return expr;
    }

    if (typeof expr === 'string') {
      if (env[expr] !== undefined) {
        return env[expr];
      }
      throw new Error(`Undefined variable: ${expr}`);
    }

    throw new Error(`Unknown expression type`);
  } catch (error) {
    console.error(
      `Error evaluating expression: ${JSON.stringify(expr, null, 2)}`
    );
    throw error;
  }
}
