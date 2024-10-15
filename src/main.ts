import { tokenize } from './tokenizer';
import { parse } from './parser';
import { evaluate } from './evaluator';

const code = `
let add = (a, b) => a + b;

let sub = (a, b) => a - b;

let hoge = (a) => add(sub(a, x), 5)

let x = 5;

hoge(20)
`;

const tokens = tokenize(code);
const ast = parse(tokens);
const env = {};
const result = evaluate(ast, env);

const props = {
  code,
  result,
  tokens: JSON.stringify(tokens, null, 0),
  ast: JSON.stringify(ast, null, 4),
} as const;

const render = ({ code, result, tokens, ast }: typeof props) =>
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
</div>
`);

render(props);
