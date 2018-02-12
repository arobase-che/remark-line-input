# remark-line-input

A [remark](https://github.com/remarkjs/remark/) plugin that parse Mardown syntax to add support for line input.


## Syntax

You can add a line input this way :

```markdown
[___Placeholder___]
```

Wich leads to :

![Screenshot](https://raw.githubusercontent.com/arobase-che/remark-line-input/master/images/example_1.png)


## Installation

Not ready at the moment.


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

