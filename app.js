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
    let indexNext = index+END.length;
    let prop = {key:{}, classes:[],id:""}
    let lets_eat = "";
    if( value.charAt(indexNext) == '{' ) {
      indexNext++;
      lets_eat="{"

      while(true) {

        var type = 0;
        while(' \t\n\r\v'.indexOf(value.charAt(indexNext)) >= 0) {
            lets_eat+=value.charAt(indexNext);
            indexNext++;
        }
        if( value.charAt(indexNext) == '}' ) {
          break;
        } else if( value.charAt(indexNext) == '.' ) { // Classes
          type = 1;
          indexNext++;
          lets_eat+='.'
        } else if( value.charAt(indexNext) == '#' ) { // ID
          type = 2;
          indexNext++;
          lets_eat+='#'
        } else { // Key
          type = 3;
        }
        let labelFirst = "";
        let labelSecond = "";

        // Extract name
        while( '=\t\b\r\v  }'.indexOf(value.charAt(indexNext)) < 0 ) {
          labelFirst+=value.charAt(indexNext);
          indexNext++;
        }

        lets_eat+=labelFirst;
        if( value.charAt(indexNext) == '=' ) { // Set labelSecond
          indexNext++;
          lets_eat+='=';

          if( value.charAt(indexNext) == '"' ) {
            indexNext++;
            lets_eat+='"';
            while('"}\n'.indexOf(value.charAt(indexNext)) < 0) {
              labelSecond+=value.charAt(indexNext);
              indexNext++;
            }
            lets_eat+=labelSecond;
            if( value.charAt(indexNext) != '"' ) {
              // Erreur
            }else{
              indexNext++;
              lets_eat+='"';
            }
          } else if( value.charAt(indexNext) == "'" ) {
            indexNext++;
            lets_eat+="'";
            while("'}\n".indexOf(value.charAt(indexNext)) < 0) {
              labelSecond+=value.charAt(indexNext);
              indexNext++;
            }
            lets_eat+=labelSecond;
            if( value.charAt(indexNext) !="'" ) {
              // Erreur
            }else{
              indexNext++;
              lets_eat+="'";
            }
          } else {
            while(' \t\n\r\v=}'.indexOf(value.charAt(indexNext)) < 0) {
              labelSecond+=value.charAt(indexNext);
              indexNext++;
            }
            lets_eat+=labelSecond;
          }
        }
        if( labelSecond ) 
          console.log("{{" + labelFirst + "=" + labelSecond + "}}");
        else
          console.log("{{" + labelFirst + "}}");
      }
      lets_eat+="}";
    }
        /* istanbul ignore if - never used (yet) */
      if (silent) return true;

    if(  index < length )
      return eat(START + subvalue.slice(1) + END.slice(1)+lets_eat)({
        type: 'line-input',
        children: [],
        data: {
          hName: 'input',
          hProperties: {
            type: 'text',
            placeholder: subvalue.replace(/^_*/g, '').replace(/_*$/g, '')
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
