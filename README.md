# remark-line-input

A [remark](https://github.com/remarkjs/remark/) plugin that parse markdown syntax to add support for line input.

This plugin is intend to be used with Javascript to create interaction.

## Syntax

You can add a line input this way :

```markdown
[___Placeholder___]
```

Which leads to :

![Screenshot](https://raw.githubusercontent.com/arobase-che/remark-line-input/master/images/example_1.png)

A markdown line input starts by `[__` and ends by `__]`.

```markdown
[___hold my beer___]
```

That syntax is not valid :
```markdown
[___ Spaces_are_not_allowed  ___]
    ^                      ^^

[___Nor line feeds
____]
```

## Installation

Easy as [npm][npm] i

```shell
$ npm install remark-line-input
```

## Dependencies:

```javascript
const unified = require('unified')
const remarkParse = require('remark-parse')
const stringify = require('rehype-stringify')
const remark2rehype = require('remark-rehype')
const lineInput = require('remark-line-input')
```

## Usage

An example of code :

```javascript
const testFile = `Login : [__email or username__]{#login}
Passwd: [__Passwd__]{#password type=password}`

unified()
  .use(remarkParse)
  .use(lineInput)
  .use(remark2rehype)
  .use(stringify)
  .process( testFile, (err, file) => {
    console.log(String(file));
  } );
```


## Configuration

This plugin support custom HTML attributes thought [md-attr-parser][attr] :

```markdown
[___Password___]{type=password}
```

![Screenshot](https://raw.githubusercontent.com/arobase-che/remark-line-input/master/images/example_2.png)

![Screenshot](https://raw.githubusercontent.com/arobase-che/remark-line-input/master/images/example_3.png)

Or :

```markdown
[___Email___]{.form-elem onchange='check();' #login}
```

## Licence

Distributed under a MIT-like license.

[attr]: "https://github.com/arobase-che/md-attr-parser"

[npm]: "https://www.npmjs.com/package/remark-line-input"

