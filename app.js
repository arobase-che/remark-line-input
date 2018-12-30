'use strict';

const parseAttr = require('md-attr-parser');

const START = '[__';
const END = '__]';

/* Function used to locate the start of a line input filed
 * Used by remark
 */
function locator(value, fromIndex) {
  const index = value.indexOf(START, fromIndex);
  return index;
}

/* Funtion which is exported */
function plugin() {
  /* Verifie if it's the syntax of a line input and return a line input node */
  function inlineTokenizer(eat, value) {
    if (!value.startsWith(START)) {
      return;
    }

    let subvalue = '';
    let index = START.length;
    const {length} = value;

    /* Try to locale the end of the line input */
    while (!value.startsWith(END, index) && index < length) {
      subvalue += value.charAt(index);
      if (value.charAt(index) === '\n') {
        return true;
      }
      index++;
    }

    let letsEat = '';
    let prop = { /* key: undefined {}  class: undefined [] id: undefined */};

    /* Parse the attributes if any with md-attr-parser */
    if (value.charAt(index + END.length) === '{') {
      const res = parseAttr(value, index + END.length);
      letsEat = res.eaten;
      ({prop} = res);
    }

    /* Allow some other kind of input */
    if (prop.type !== 'password') {
      prop.type = 'text';
    }

    /* Underscores in the placeholder become whitespaces */
    prop.placeholder = subvalue.replace(/^_*/g, '').replace(/_*$/g, '') || undefined;

    if (index < length) {
      return eat(START + subvalue + END + letsEat)({
        type: 'line-input',
        children: [],
        data: {
          hName: 'input',
          hProperties: prop,
        },
      });
    }
    return true;
  }

  inlineTokenizer.locator = locator;

  const {Parser} = this;

  // Inject inlineTokenizer
  const {inlineTokenizers} = Parser.prototype;
  const {inlineMethods} = Parser.prototype;
  inlineTokenizers.input = inlineTokenizer;
  inlineMethods.splice(inlineMethods.indexOf('url'), 0, 'input');

  const {Compiler} = this;

  // Stringify
  if (Compiler) {
    const {visitors} = Compiler.prototype;
    visitors.lineinput = function (node) {
      return `[__${this.all(node).join('')}__]`;
    };
  }
}

module.exports = plugin;
