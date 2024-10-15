// 四則演算のみ
// export function tokenize(input: string): string[] {
//   return input.match(/\d+|\+|\-|\*|\/|\(|\)|\w+/g) || [];
// }

// 変数定義可能
// export function tokenize(input: string): string[] {
//   return (
//     input
//       .match(/\s*(let|\w+|\d+|[+\-*/=();])\s*/g)
//       ?.map((token) => token.trim()) || []
//   );
// }

// 関数定義可能
export function tokenize(input: string): string[] {
  return (
    input
      .match(/\s*(=>|let|\w+|\d+|[+\-*/=(){};,.])\s*/g) // "=>" を優先してマッチさせる
      ?.map((token) => token.trim()) || []
  );
}
