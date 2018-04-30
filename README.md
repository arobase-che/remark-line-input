# remark-line-input

A [remark](https://github.com/remarkjs/remark/) plugin that parse Mardown syntax to add support for line input.


## Syntax

You can add a line input this way :

```markdown
[___Placeholder___]
```

Wich leads to :

![Screenshot](https://raw.githubusercontent.com/arobase-che/remark-line-input/master/images/example_1.png)

You must use at least 2 underscores, and no spaces are allowed between the opening bracket and the first underscore nor between the last underscore and the closing bracket. Spaces can be used in the placeholder :

```markdown
[___hold my beer___]
```

## Installation

Easy as npm i

```shell
$ npm install remark-line-input
```

You install also that plugins : "unified remark-parse rehype-stringify remark-rehype"
```shell
$ npm install unified remark-parse rehype-stringify remark-rehype
```

## Usage

An example of code :

```js
const unified = require('unified')
const remarkParse = require('remark-parse')
const stringify = require('rehype-stringify')
const remark2rehype = require('remark-rehype')

const lineInput = require('remark-line-input')

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

This plugin support custom HTML attributes :

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

MIT

