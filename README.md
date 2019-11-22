# gatsby-plugin-node-fields

Important Changes: There has been an important change to the API in reaching V3. As of V2, all functions now recieve `actions` as their final argument, from which `createNodeField` or any other function can be pulled if needed. As of V3 an additional final argument is passed in to all functions: `getNode` which allows a node to be looked up using an id. This allows information to be pulled from a parent node for example. This is a breaking change _only_ if you are using the function version, in which case you will need to pass `getNode` as the third argument to `attachFields` (see below).

`gatsby-plugin-node-fields` offers you a simple, consistent way to manage the creation of fields on your nodes, with support for default values, transformations and validation of values. It is well tested and uses helpful error messages to guide you away from the rocks.

## Quickstart

### Install

```bash
yarn add gatsby-plugin-node-fields
```

### Plugin vs Function

You can use `gatsby-plugin-node-fields` either as a standard Gatsby plugin, or you can use it as standalone function. Both will perform the same task, but you might prefer to keep node manipulation in your `gatsby-node.js` file instead of via a plugin defined in your `gatsby-config.js`.

#### Plugin

If you want to use it as a plugin, add it as the last plugin. You can place it anywhere, but bear in mind that it will only see changes made by plugins that come before it. Unless you have a good reason not to, place it last.

```javaScript
// gatsby-config.js

const plugins = [
 …
 {
  resolve: `gatsby-plugin-node-fields`,
  options: {
    // Your list of descriptors
    descriptors: [
      …
    ],
  },
 }
]

module.exports = {
  plugins,
}
```

#### Function

If you'd prefer to use it as a function in your `gatsby-node.js` file, you need to hook into Gatsby's `onCreateNode` yourself, passing in the arguments it expects:

```javaScript
// gatsby-node.js

const { attachFields } = require(`gatsby-plugin-node-fields`)

// Your list of descriptors
const descriptors = [
  …
]

exports.onCreateNode = ({ node, actions, getNode }) => {
  attachFields(node, actions, getNode, descriptors)
}
```

## Some Examples

### Default value for a field

Imagine you have a series of Markdown Articles. They are mainly written by the same person with an occasional guest author. You support an `author` field in your article pages' front matter, but you don't want your regular author to have to add their own name to every article. Effectively you need a default value for `author`. To implement this you would create the following descriptor:

```javaScript
[
  {
    predicate: isArticleNode,
    fields: [
      {
        name: 'author',
        getter: node => node.frontmatter.author,
        defaultValue: 'John Doe',
      },
    ]
  }
]
```

This would result in `node.fields.author` being populated with either the author field of the node's front matter, or with a default value of 'John Doe'. In reality you'd probably want to pull the default value from a config object or similar.

### Transforming a value

Imagine you allow an author to add a `keywords` field to an article's front matter which you use for the `keywords` metadata of the page (which will be a comma-separated list), and also extract for use as tags. To make these tags easier to work with you want to convert then to an array of strings.

```javaScript
[
  {
    predicate: isArticleNode,
    fields: [
      {
        name: 'tags',
        getter: node => node.frontmatter.keywords,
        defaultValue: '',
        transformer: value => isEmptyString(value) ? [] : cslToArray(value),
      },
    ]
  }
]
```

Here we again use `getter` to pull the value we want from the node's `frontmatter`. We set it's `defaultValue` to `''`, then we use the `transformer` to either transform the value to an empty array, or to an array of strings using a helper function `cslToArray`. Note that it might seem strange to set a default value, then immediately check it and convert it to an array, but I've found that treating each stage discretely makes for much cleaner code. This way the transformer knows it will receive a string, making it more focused.

### Validating a value

It's often better to handle invalid values at compile time rather than trying to handle these values in the UI. Imagine you allow an author to add a `title` keyword to an article's frontmatter. Obviously without a title, an Article shouldn't be valid and it doesn't make sense to set a default title, so you add a validator to ensure the article's title is a non-empty string.

```javaScript
[
  {
    predicate: isArticleNode,
    fields: [
      {
        name: 'title',
        getter: node => node.frontmatter.title,
        validator: isNonEmptyString
      },
    ]
  }
]
```

This will result in an error with a useful message if an article is encountered that doesn't have a title set. For obvious reasons it's better to set a sensible default in most cases, but in instances like this, a useful compile-time error is better than a potentially obscure runtime error, or invalid data being displayed.

## Overview

I have found that mixing queries for values stored in a node's `frontmatter` with queries for values stored in generated fields is uneven and confusing, so I now transfer all values that I will use in the UI over to fields. This transfer gives us the opportunity to do a number of important things:

- set a default value
- validate a value
- transform a value

### Validation

Your descriptors will be validated against a schema when first used with useful error messages if you have added an invalid field or the value of required field is invalid or missing.

### Descriptors

The plugin automatically hooks into Gatsby's `onCreateNode` life cycle hook and will check the node it receives against an array of descriptors you provide. Each descriptor must provide a `predicate` - a function that will be passed the node and decides whether the descriptor should be used to transform it. For example we might want to check if the node is Markdown node, or if it represents a file from a particular directory.

If a descriptor's `predicate` returns true, the descriptor will be used to create new fields on that node using the contents of the descriptor's `fields` array. Each item in the `fields` array represents the creation of one or more fields and describes a series of steps

Here is an example of a descriptor that will be run for all markdown nodes, validating that a title exists, then running is through a function called `preventOrphans` before saving it as a `title` field:

```javaScript
[
  // Descriptor
  {
    predicate: isMarkdownNode,
    fields: [
      {
        name: 'title',
        getter: node => node.frontmatter.title,
        validator: isString,
        transformer: preventOrphans,
      },
    ]
  },
]
```

#### _predicate_ [function(node, getNode)]

A (node, getNode) that receives the newly created node as and returns `true` if the descriptor should apply to that node and `false` if it doesn't. Multiple descriptors can be applied to the same node if their predicates return true. The predicate receives a second argument which is Gatsby's `getNode` (node, getNode). This can be used to extend predicate logic to other related nodes.

#### _fields_ [array]

An array of objects representing fields that will be created on the node. Each object comprises of a set of keys and values that describe the creation process of a new field. You can use as few or as many keys as needed. For example if all you want to do is set a default value you could use only the `name` and `defaultValue` keys:

```javaScript
{
  name: 'example',
  defaultValue: 'Unknown',
}
```

### Fields

A field can contain one or more of the following keys that describe which fields it should add, and how it should obtain and transform the data that will populate them. You can perform a one-to-one, many-to-one, or one-to-many mapping between values and fields. The order in which these fields are used is

- `getter` or `name`
- `defaultValue`
- `validator`
- `transformer`
- `setter` or `name`

#### _name_ [string]

A `name` field represents the name of the field that will be created. If no `getter` field is present on the descriptor, it will also be used to access a value on the node. For example if the `name` is 'alpha', it will create a field on the node called 'alpha'. If no `getter` field is present on the descriptor is will try and get the value for this field from `node.alpha`.

#### _getter_ [(node, getNode)(node, context, actions, getNode)]

A `getter` is a (node, getNode) that gets the value or values from the node. If a `getter` is not defined and a `name` is defined, `node[name]` will be used in its place.

A simple getter might look like:

```javaScript
node => node.frontmatter.title
```

You could also pull the value from a config object or anywhere else you like.

#### _defaultValue_ [* | function(node, context, actions, getNode)]

A `defaultValue` supplies a value in instances where no value exists on the node (the value is `undefined`), or no means of getting a value has been defined on the descriptor. In the following cases `defaultValue` will be used:

- Only a `name` was defined and there is no prop on the node with that name.
- A prop of `name` exists with but has a value of `undefined`
- A `getter` was defined but returned `undefined`,
- Neither a `name` nor a `getter` were defined.

If `defaultValue` is a function it should return a default value. If the value of `defaultValue` is not a function, that value will be used as the default value.

For example by using a function, you could use supply a default value using another property of the node:

```javaScript
node => node.someOtherValue
```

#### _validator_ [function(value, node, context, actions, getNode)]

A `validator` is just a predicate that receives the value and returns true or false, depending if it deems it to be valid or not. For example we might have a descriptor that has looked up `node.Front Matter.slug`, but there is no slug defined, we use a sanitised version of the title instead:

```javaScript
value => isValidDate(value)
```

#### _transformer_ [function(value, node, context, actions, getNode)]

A `transformer` transforms the value in some way. For example it might run the value through a function that cleans it up or formats it. A transformer function will be called with three arguments: the value, the node and the context, if defined.

```javaScript
value => preventOrphans(value)
```

#### _setter_ [function(value, node, context, actions, getNode)]

A _setter_ defines how the value(s) are translated to fields. If no `setter` is defined, the _name_ field will be used to create a field of that name using Gatsby's `createNodeField` , however using a `setter` function allows more flexibility. For example a value might be an object and we might want to transfer its values to multiple fields. A `setter` will receive three arguments: the value, `actions`, and any context. If you define a setter, that setter is responsible for using `actions.createNodeField` to create fields.

```javaScript
(value, node) => {
  createNodeField({
    node,
    name: 'alpha',
    value: value.beta
  })
}
```

### Context

To keep things as functional as possible and prevent the need for you to reach out to external data sources from within your functions, you can pass in a `context`. Context can be anything you like, but will probably be an object. `getter`, `defaultValue`, `validator`, `transformer`, and `setter` functions all receive the context as their second argument.

If you are using the plugin, pass the context as an option:

```javaScript
{
  resolve: `gatsby-plugin-node-fields`,
  options: {
    descriptors: [
      …
    ],
    context: {
      …
    }
  },
}
```

If you are using the function, pass it in as the fourth argument:

```javaScript
attachFields(node, actions, descriptors, context)
```

## Maintenance

Gatsby doesn't support ES6 imports, so we need to compile our `./src` to `./lib`, then reference the compiled file from `gatsby-node.js`.

### Tests

Tests are written with Jest:

```bash
yarn test
```
