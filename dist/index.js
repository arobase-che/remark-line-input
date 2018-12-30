'use strict';

var parseAttr = require('md-attr-parser');

var START = '[__';
var END = '__]';
/* Function used to locate the start of a line input filed
 * Used by remark
 */

function locator(value, fromIndex) {
  var index = value.indexOf(START, fromIndex);
  return index;
}
/* Funtion which is exported */


function plugin() {
  /* Verifie if it's the syntax of a line input and return a line input node */
  function inlineTokenizer(eat, value) {
    if (!value.startsWith(START)) {
      return;
    }

    var subvalue = '';
    var index = START.length;
    var length = value.length;
    /* Try to locale the end of the line input */

    while (!value.startsWith(END, index) && index < length) {
      subvalue += value.charAt(index);

      if (value.charAt(index) === '\n') {
        return true;
      }

      index++;
    }

    var letsEat = '';
    var prop = {
      /* key: undefined {}  class: undefined [] id: undefined */
    };
    /* Parse the attributes if any with md-attr-parser */

    if (value.charAt(index + END.length) === '{') {
      var res = parseAttr(value, index + END.length);
      letsEat = res.eaten;
      prop = res.prop;
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
          hProperties: prop
        }
      });
    }

    return true;
  }

  inlineTokenizer.locator = locator;
  var Parser = this.Parser; // Inject inlineTokenizer

  var inlineTokenizers = Parser.prototype.inlineTokenizers;
  var inlineMethods = Parser.prototype.inlineMethods;
  inlineTokenizers.input = inlineTokenizer;
  inlineMethods.splice(inlineMethods.indexOf('url'), 0, 'input');
  var Compiler = this.Compiler; // Stringify

  if (Compiler) {
    var visitors = Compiler.prototype.visitors;

    visitors.lineinput = function (node) {
      return "[__".concat(this.all(node).join(''), "__]");
    };
  }
}

module.exports = plugin;