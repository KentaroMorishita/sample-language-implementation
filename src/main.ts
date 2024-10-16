import { tokenize } from './tokenizer';
import { parse } from './parser';
import { evaluate, globalEnv } from './evaluator';

const code = `
let add = (a, b) => a + b;
let sub = (a, b) => a - b;
let mix = (a) => add(sub(a, x), 5)
let x = 5;

print(mix(20))
print("Hello, World!")
`;

const tokens = tokenize(code);
console.log(tokens.map((v) => v));
const ast = parse(tokens);
console.log(JSON.stringify(ast, null, 2));
const result = evaluate(ast, globalEnv);

const props = {
  code,
  result,
  tokens: JSON.stringify(tokens.map(v => v.value), null, 0),
  fullTokens: JSON.stringify(tokens, null, 4),
  ast: JSON.stringify(ast, null, 4),
} as const;

const render = ({ code, result, tokens, fullTokens, ast }: typeof props) =>
  (document.querySelector('#app')!.innerHTML = `
<div>
  <div style="white-space: pre-wrap; background: black; color: white; padding-left: 20px">
    <code>${code}</code>
  </div>
  <br/>
  <div>result: ${result}</div>
  <br/>
  <div style="white-space: pre-wrap">tokens: ${tokens}</div>
  <br/>
  <div style="white-space: pre-wrap">ast: ${ast}</div>
  <br/>
  <div style="white-space: pre-wrap">FullTokens: ${fullTokens}</div>
  <br/>
</div>
`);

render(props);
