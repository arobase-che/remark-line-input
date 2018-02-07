'use strict';

const START = '[__';
const END = '__]';

function locator(value, fromIndex) {
  const index = value.indexOf(START, fromIndex);
  return index;
}

function parseHTMLparam(value, indexNext) {
  let letsEat = '{';
  indexNext++;

  const eat = chars => {
    let eaten = '';
    while (chars.indexOf(value.charAt(indexNext)) >= 0) {
      letsEat += value.charAt(indexNext);
      eaten += value.charAt(indexNext);
      indexNext++;
    }
    return eaten;
  };
  const eatUntil = chars => {
    let eaten = '';
    while (chars.indexOf(value.charAt(indexNext)) < 0) {
      letsEat += value.charAt(indexNext);
      eaten += value.charAt(indexNext);
      indexNext++;
    }
    return eaten;
  };

  const prop = {key: undefined /* {} */, class: undefined /* [] */, id: undefined, type: 'text'};
  let type;

  while (value.charAt(indexNext) !== '}') {
    let labelFirst = '';
    let labelSecond;

    eat(' \t\n\r\v');

    if (value.charAt(indexNext) === '}') { // Fin l'accolade
      continue;
    } else if (value.charAt(indexNext) === '.') { // Classes
      type = 'class';
      indexNext++;
      letsEat += '.';
    } else if (value.charAt(indexNext) === '#') { // ID
      type = 'id';
      indexNext++;
      letsEat += '#';
    } else { // Key
      type = 'key';
    }

    // Extract name
    labelFirst = eatUntil('=\t\b\r\v  }');

    if (value.charAt(indexNext) === '=') { // Set labelSecond
      indexNext++;
      letsEat += '=';

      if (value.charAt(indexNext) === '"') {
        indexNext++;
        letsEat += '"';
        labelSecond = eatUntil('"}\n');

        if (value.charAt(indexNext) === '"') {
          indexNext++;
          letsEat += '"';
        } else {
          // Erreur
        }
      } else if (value.charAt(indexNext) === '\'') {
        indexNext++;
        letsEat += '\'';
        labelSecond = eatUntil('\'}\n');

        if (value.charAt(indexNext) === '\'') {
          indexNext++;
          letsEat += '\'';
        } else {
          // Erreur
        }
      } else {
        labelSecond = eatUntil(' \t\n\r\v=}');
      }
    }
    switch (type) {
      case 'id': // ID
        prop.id = prop.id || labelFirst;
        break;
      case 'class':
        if (!prop.class) {
          prop.class = [];
        }
        prop.class.push(labelFirst);
        break;
      case 'key':
        if (labelFirst !== 'id' && labelFirst !== 'class') {
          prop[labelFirst] = labelSecond || '';
        }
        break;
      default:

    }
  }
  letsEat += '}';

  return {type, prop, eaten: letsEat};
}

function plugin() {
  function inlineTokenizer(eat, value, silent) {
    if (!this.options.gfm || !value.startsWith(START)) {
      return;
    }

    let subvalue = '';
    let index = 1;
    const length = value.length;
    const now = eat.now();
    now.column += 2;
    now.offset += 2;

    while (!value.startsWith(END, index) && ++index < length) {
      subvalue += value.charAt(index);
      if (value.charAt(index) === '\n') {
        return true;
      }
    }
    let letsEat = '';
    let prop = {key: undefined /* {} */, class: undefined /* [] */, id: undefined};
    if (value.charAt(index + END.length) === '{') {
      const res = parseHTMLparam(value, index + END.length);
      letsEat = res.eaten;
      prop = res.prop;
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true;
    }

    if (prop.type !== 'password') {
      prop.type = 'text';
    }

    prop.placeholder = subvalue.replace(/^_*/g, '').replace(/_*$/g, '') || undefined;

    if (index < length) {
      return eat(START + subvalue.slice(1) + END.slice(1) + letsEat)({
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

  const Parser = this.Parser;

  // Inject inlineTokenizer
  const inlineTokenizers = Parser.prototype.inlineTokenizers;
  const inlineMethods = Parser.prototype.inlineMethods;
  inlineTokenizers.input = inlineTokenizer;
  inlineMethods.splice(inlineMethods.indexOf('url'), 0, 'input');

  const Compiler = this.Compiler;

  // Stringify
  if (Compiler) {
    const visitors = Compiler.prototype.visitors;
    visitors.lineinput = function (node) {
      return `[__${this.all(node).join('')}__]`;
    };
  }
}

module.exports = plugin;
