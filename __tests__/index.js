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
test('line-input-simple-raw', t => {
  const {contents} = renderRaw('[__here__]');
  t.is(contents, '<p><input type="text" placeholder="here"></p>');
});

test('line-input-empty-raw', t => {
  const {contents} = renderRaw('[____]');
  t.is(contents, '<p><input type="text"></p>');
});

test('line-input-id', t => {
  const {contents} = render('[__here__]{#unicorn}');
  t.is(contents, '<p><input id="unicorn" type="text" placeholder="here"></p>');
});

test('line-input-class', t => {
  const {contents} = render('[__here__]{.unicorn}');
  t.is(contents, '<p><input class="unicorn" type="text" placeholder="here"></p>');
});

test('line-input-classes', t => {
  const {contents} = render('[__here__]{.unicorn .fox}');
  t.is(contents, '<p><input class="unicorn fox" type="text" placeholder="here"></p>');
});

test('line-input-key-value', t => {
  const {contents} = render('[__here__]{unicorn="horse + horn"}');
  t.is(contents, '<p><input unicorn="horse + horn" type="text" placeholder="here"></p>');
});

test('line-input-overwrite-type', t => {
  const {contents} = render('[__here__]{type=buttom}');
  t.is(contents, '<p><input type="text" placeholder="here"></p>');
});

test('line-input-overwrite-placeholder', t => {
  const {contents} = render('[__here__]{placeholder=\'not here\'}');
  t.is(contents, '<p><input type="text" placeholder="here"></p>');
});

test('line-input-overwrite-class', t => {
  const {contents} = render('[__here__]{class=\'unicorn\' .fox}');
  t.is(contents, '<p><input class="fox" type="text" placeholder="here"></p>');
});

test('line-input-overwrite-id', t => {
  const {contents} = render('[__here__]{id=unicorn #fox}');
  t.is(contents, '<p><input id="fox" type="text" placeholder="here"></p>');
});

test('line-input-multi-id', t => {
  const {contents} = render('[__here__]{#unicorn #fox}');
  t.is(contents, '<p><input id="unicorn" type="text" placeholder="here"></p>');
});

test('line-input-raw', t => {
  const {contents} = renderRaw(file(join(__dirname, 'input-raw.md')));
  t.snapshot(contents);
});