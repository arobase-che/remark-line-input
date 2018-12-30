import unified from 'unified';

import test from 'ava';
import raw from 'rehype-raw';
import reParse from 'remark-parse';
import stringify from 'rehype-stringify';
import remark2rehype from 'remark-rehype';
import parse5 from 'parse5';

import plugin from '..';

const dom5 = require('dom5');

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

const parse = cont => parse5.parse(cont);

test('line-input-simple', t => {
  const {contents} = render('[__here__]');
  t.deepEqual(parse(contents), parse('<p><input type="text" placeholder="here"></p>'));
});

test('line-input-empty', t => {
  const {contents} = render('[____]');
  t.deepEqual(parse(contents), parse('<p><input type="text"></p>'));
});
test('line-input-simple-raw', t => {
  const {contents} = renderRaw('[__here__]');
  t.deepEqual(parse(contents), parse('<p><input type="text" placeholder="here"></p>'));
});

test('line-input-empty-raw', t => {
  const {contents} = renderRaw('[____]');
  t.deepEqual(parse(contents), parse('<p><input type="text"></p>'));
});

test('line-input-id', t => {
  const {contents} = render('[__Some text__]{#unicorn}');
  t.deepEqual(parse(contents),
    parse('<p><input id="unicorn" type="text" placeholder="Some text"></p>')
  );
});

test('line-input-class', t => {
  const {contents} = render('[_______panda__]{.unicorn}');
  t.deepEqual(parse(contents),
    parse('<p><input class="unicorn" type="text" placeholder="panda"></p>')
  );
});

test('line-input-classes', t => {
  const {contents} = render('[__strong unicorn__]{.unicorn .fox}');
  t.deepEqual(parse(contents),
    parse('<p><input class="unicorn fox" type="text" placeholder="strong unicorn"></p>')
  );
});

test('line-input-key-value', t => {
  const {contents} = render('[__math exercice__]{unicorn="horse + horn"}');
  t.deepEqual(parse(contents),
    parse('<p><input unicorn="horse + horn" type="text" placeholder="math exercice"></p>')
  );
});

test('line-input-overwrite-type', t => {
  const {contents} = render('[__Good answer__]{type=buttom}');
  t.deepEqual(parse(contents),
    parse('<p><input type="text" placeholder="Good answer"></p>')
  );
});

test('line-input-overwrite-placeholder', t => {
  const {contents} = render('[__Please not a bad answer__]{placeholder=\'not here\'}');
  t.deepEqual(parse(contents),
    parse('<p><input placeholder="Please not a bad answer" type="text"></p>')
  );
});

test('line-input-overwrite-class', t => {
  const {contents} = render('[__A result__]{class=\'unicorn\' .fox}');
  t.deepEqual(parse(contents),
    parse('<p><input class="unicorn fox" type="text" placeholder="A result"></p>')
  );
});

test('line-input-overwrite-id', t => {
  const {contents} = render('[__email__]{id=unicorn #fox}');
  t.deepEqual(parse(contents),
    parse('<p><input id="unicorn" type="text" placeholder="email"></p>')
  );
});

test('line-input-multi-id', t => {
  const {contents} = render('[__Login__]{#unicorn #fox}');
  t.deepEqual(parse(contents),
    parse('<p><input id="unicorn" type="text" placeholder="Login"></p>')
  );
});

test('line-input-password', t => {
  const {contents} = render('[__Password__]{#passwd type=password}');
  t.deepEqual(parse(contents),
    parse('<p><input id="passwd" type="password" placeholder="Password"></p>')
  );
});

test('not a line-input', t => {
  const {contents} = renderRaw(`
[_ text line_______]`);

  t.is(null, dom5.query(parse5.parse(contents), dom5.predicates.hasTagName('input')));
});

test('not a line-input 2', t => {
  const {contents} = renderRaw(`
[___]`);

  t.is(null, dom5.query(parse5.parse(contents), dom5.predicates.hasTagName('input')));
});

test('not a line-input 3', t => {
  const {contents} = renderRaw(`
[______ Not a line input
_______] some text`);
  t.is(null, dom5.query(parse5.parse(contents), dom5.predicates.hasTagName('input')));
});

test('not a line-input 4', t => {
  const {contents} = renderRaw(`
[___ Not a line input ]`);

  t.is(null, dom5.query(parse5.parse(contents), dom5.predicates.hasTagName('input')));
});

test('is a line-input', t => {
  const {contents} = renderRaw('a[___This is a text___]qsd');

  t.not(null, dom5.query(parse5.parse(contents), dom5.predicates.hasTagName('input')));
});

test('is line-input 2', t => {
  const {contents} = renderRaw(`
[____]`);

  t.not(null, dom5.query(parse5.parse(contents), dom5.predicates.hasTagName('input')));
});

