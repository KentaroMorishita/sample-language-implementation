import { useQueue } from './helpers/useQueue';

export type Token =
  | { type: 'keyword'; value: string }
  | { type: 'operator'; value: string }
  | { type: 'identifier'; value: string }
  | { type: 'number'; value: number }
  | { type: 'punctuation'; value: string }
  | { type: 'string'; value: string };

const KEYWORDS = ['let'];
const OPERATORS = ['+', '-', '*', '/', '=', '=>'];
const PUNCTUATION = ['(', ')', '{', '}', ';', ',', '.'];
const QUOTES = ['"', "'", '`'];

// ソートして複数文字の演算子を優先的にマッチさせる
const SORTED_OPERATORS = [...OPERATORS].sort((a, b) => b.length - a.length);

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const { advance, peek, hasMore, position } = useQueue<string>(
    input.split('')
  );

  function isKeyword(value: string): boolean {
    return KEYWORDS.includes(value);
  }

  function isOperator(value: string): boolean {
    return SORTED_OPERATORS.includes(value);
  }

  function isPunctuation(value: string): boolean {
    return PUNCTUATION.includes(value);
  }

  function isQuote(value: string): boolean {
    return QUOTES.includes(value);
  }

  while (hasMore()) {
    const char = peek();

    // 空白をスキップ
    if (/\s/.test(char)) {
      advance();
      continue;
    }

    // クォート内の文字列を処理
    if (isQuote(char)) {
      const quoteType = advance(); // 開始クォートを取得
      let value = '';

      while (hasMore() && peek() !== quoteType) {
        value += advance();
      }

      if (!hasMore() || peek() !== quoteType) {
        throw new Error(`Unterminated string starting with ${quoteType}`);
      }

      advance(); // 終了クォートをスキップ
      tokens.push({ type: 'string', value });
      continue;
    }

    // 複数文字の演算子
    let matched = false;
    for (const operator of SORTED_OPERATORS) {
      const slice = input.slice(position(), position() + operator.length);
      if (isOperator(slice)) {
        tokens.push({ type: 'operator', value: slice });
        for (let i = 0; i < slice.length; i++) advance();
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // キーワードと識別子
    if (/[a-zA-Z_]\w*/.test(char)) {
      let identifier = '';
      while (/[a-zA-Z_]\w*/.test(peek())) {
        identifier += advance();
      }

      if (isKeyword(identifier)) {
        tokens.push({ type: 'keyword', value: identifier });
      } else {
        tokens.push({ type: 'identifier', value: identifier });
      }
      continue;
    }

    // 数字
    if (/\d/.test(char)) {
      let number = '';
      while (hasMore() && /\d/.test(peek())) {
        number += advance();
      }
      tokens.push({ type: 'number', value: Number(number) });
      continue;
    }

    // 句読点
    if (isPunctuation(char)) {
      tokens.push({ type: 'punctuation', value: peek() });
      advance();
      continue;
    }

    throw new Error(`Unexpected token: ${char}`);
  }

  return tokens;
}
