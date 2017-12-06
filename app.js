'use strict';


const START = '[__';
const END   = '__]';

function locator(value, fromIndex) {
  var index = value.indexOf(START, fromIndex);
  return index;
}

function plugin() {
  function inlineTokenizer(eat, value, silent) {
    if (!this.options.gfm || !value.startsWith(START)) {
      return;
    }

    var character = '';
    var previous = '';
    var preceding = '';
    var subvalue = '';
    var index = 1;
    var length = value.length;
    var now = eat.now();
    now.column += 2;
    now.offset += 2;

    while (!value.startsWith(END, index) && ++index < length) {
      subvalue+=value.charAt(index);
      if( value.charAt(index) == '\n' )
        return true;

      }
        /* istanbul ignore if - never used (yet) */
      if (silent) return true;

    if(  index < length )
      return eat(START + subvalue.slice(1) + END.slice(1) )({
        type: 'lineEdit',
        children: [],
        data: {
          hName: 'input',
          hProperties: {
            type: 'text',
            placeholder: subvalue
          }
        }
      });
    else 
      return true;

  }
  inlineTokenizer.locator = locator;

  var Parser = this.Parser;

  // Inject inlineTokenizer
  var inlineTokenizers = Parser.prototype.inlineTokenizers;
  var inlineMethods = Parser.prototype.inlineMethods;
  inlineTokenizers.input = inlineTokenizer;
  inlineMethods.splice(inlineMethods.indexOf('url'), 0, 'input');

  var Compiler = this.Compiler;

  // Stringify
  if (Compiler) {
    var visitors = Compiler.prototype.visitors;
    visitors.lineinput = function (node) {
      return '[__' + this.all(node).join('') + '__]';
    };
  }
}

module.exports = plugin;
