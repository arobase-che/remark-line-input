'use strict';


const START = '[__';
const END   = '__]';

function locator(value, fromIndex) {
  var index = value.indexOf(START, fromIndex);
  return index;
}

function prop2HTML( prop ) {
  let html = '';

  if( 'id' in prop && prop['id'] ) {
    html += 'id=' + prop['id'];
  }
  if( 'class' in prop ) {
    if( html ) html += ' '
    html='class="' + prop['class'].join(' ') + '"';
  }
  if( 'key' in prop ) {
    Object.entries(prop['key']).forEach(
      (key, value) => {
        if(html) html += ' '
        if(value) {
          html += key+'"'+value+'"';
        }else{
          html +=key
        }
      }
    )
  }

  return html
}

function parseHTMLparam( value, indexNext ) {
  let lets_eat = "{";
  indexNext++;

  const eat = ( ( chars ) => {
    let eaten = ""
    while(chars.indexOf(value.charAt(indexNext)) >= 0) {
      lets_eat+=value.charAt(indexNext);
      eaten   +=value.charAt(indexNext);
      indexNext++;
    }
    return eaten;
  });
  const eat_until = ( ( chars ) => {
    let eaten = ""
    while(chars.indexOf(value.charAt(indexNext)) < 0) {
      lets_eat+=value.charAt(indexNext);
      eaten   +=value.charAt(indexNext);
      indexNext++;
    }
    return eaten;
  });



  let prop = {key:undefined /* {} */, 'class':undefined /*[]*/,id:undefined /*""*/}
  let type;
    
  while(true) {
    let labelFirst = "";
    let labelSecond = undefined;

    eat(' \t\n\r\v');

    if( value.charAt(indexNext) == '}' ) { // Fin l'accolade
      break;
    } else if( value.charAt(indexNext) == '.' ) { // Classes
      type = 'class';
      indexNext++;
      lets_eat+='.'
    } else if( value.charAt(indexNext) == '#' ) { // ID
      type = 'id';
      indexNext++;
      lets_eat+='#'
    } else { // Key
      type = 'key';
    }

    // Extract name
    labelFirst = eat_until( '=\t\b\r\v  }')

    if( value.charAt(indexNext) == '=' ) { // Set labelSecond
      indexNext++;
      lets_eat+='=';

      if( value.charAt(indexNext) == '"' ) {
        indexNext++;
        lets_eat+='"';
        labelSecond = eat_until('"}\n')

        if( value.charAt(indexNext) != '"' ) {
          // Erreur
        }else{
          indexNext++;
          lets_eat+='"';
        }
      } else if( value.charAt(indexNext) == "'" ) {
        indexNext++;
        lets_eat+="'";
        labelSecond = eat_until("'}\n")

        if( value.charAt(indexNext) !="'" ) {
          // Erreur
        }else{
          indexNext++;
          lets_eat+="'";
        }
      } else {
        labelSecond = eat_until(' \t\n\r\v=}');
      }
    }
    switch( type ) {
      case 'id': // ID
        prop['id']=labelFirst;
      break;
      case 'class':
        if( ! prop['class'] )
          prop['class'] = []
        prop['class'].push(labelFirst);
      break;
      case 'key':
        if( labelFirst != 'id' && labelFirst != 'class' )
        prop[labelFirst] = labelSecond ? labelSecond : '';
      break;
  }
    if( labelSecond ) 
      console.log("{{" + labelFirst + "=" + labelSecond + "}}");
    else
      console.log("{{" + labelFirst + "}}");
  }
  lets_eat+="}";

  return {type:type, prop:prop, eaten:lets_eat};

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
    let lets_eat = ""
    let prop = {key:undefined /* {} */, 'class':undefined /*[]*/,id:undefined /*""*/}
    if( value.charAt(index+END.length) == '{' ) {
      let res = parseHTMLparam( value, index+END.length)
      lets_eat = res.eaten;
      console.log(res.eaten);
      prop=res.prop
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) return true;

    if( prop['type'] != 'password' )
      prop['type'] = 'text';

    prop['placeholder'] = subvalue.replace(/^_*/g, '').replace(/_*$/g, ''),

    console.log(prop);
    if(  index < length )
      return eat(START + subvalue.slice(1) + END.slice(1)+lets_eat)({
        type: 'line-input',
        children: [],
        data: {
          hName: 'input',
          hProperties: prop 
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
