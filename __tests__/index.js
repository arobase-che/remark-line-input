import {readFileSync as file} from 'fs';
import {join} from 'path';
import unified from 'unified';

import test from 'ava';
import raw from 'rehype-raw';
import reParse from 'remark-parse';
import stringify from 'rehype-stringify';
import remark2rehype from 'remark-rehype';

import plugin from '../app';

const render = text => unified()
  .use(reParse)
  .use(plugin)
  .use(remark2rehype)
  .use(stringify)
  .processSync(text);

const renderRaw = text => unified()
  .use(reParse)
  .use(plugin)
  .use(remark2rehype, {allowDangerousHTML: true})
  .use(raw)
  .use(stringify)
  .processSync(text);

test('line-input', t => {
  const {contents} = render(file(join(__dirname, 'input-simple.md')));
  t.snapshot(contents);
});

test('line-input-simple', t => {
  const {contents} = render('[__here__]');
  t.is(contents, '<p><input type="text" placeholder="here"></p>');
});

test('line-input-empty', t => {
  const {contents} = render('[____]');
  t.is(contents, '<p><input type="text"></p>');
});

test.todo('id text');
test.todo('class');
test.todo('classes');
test.todo('key-value');
test.todo('classes key-value id');
test.todo('overwrite type');
test.todo('overwrite placeholder');
test.todo('overwrite class');
test.todo('overwrite id');
test.todo('multiple id');

test('line-input-raw', t => {
  const {contents} = renderRaw(file(join(__dirname, 'input-raw.md')));
  t.snapshot(contents);
});
