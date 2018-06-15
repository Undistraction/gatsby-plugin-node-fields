# gatsby-plugin-node-fields

`gatsby-plugin-node-fields` offers you a simple, consistent way to manage the creation of fields on your nodes, with support for default values, transformations and validation of values. It is well tested and uses helpful error messages to guide you away from the rocks. 

## Quickstart

### Install

```bash
yarn add gatsby-plugin-node-fields
```

You can use `gatsby-plugin-node-fields` either as a standard Gatsby plugin, or you can use it as standalone function.

### Plugin

If you want to use it as a plugin, add it as the last plugin. You can place it anywhere, but bear in mind that it will only see changes made by plugins that come before it. Unless you have a good reason not to, place it last.

```javaScript
// gatsby-config.js

const plugins = [
 …
 {
  resolve: `gatsby-plugin-node-fields`,
  options: {
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

### Function

If you'd prefer to use it as a function in your `gatsby-node.js` file, you need to tie into Gatsby's `onCreateNode` yourself:

```javaScript
// gatsby-node.js

const { attachFields } = require(`gatsby-plugin-node-fields`)

const descriptors = [
  …
]

exports.onCreateNode = ({ node, boundActionCreators }) => {
  const { createNodeField } = boundActionCreators
  attachFields(node, createNodeField, descriptors)
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
        defaultValue: config.defaults.author,
      },
    ]
  }
]
```

This would result in `node.fields.author` being populated with either the author field of the node's front matter, or with a default value pulled from a config object. 

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
        transformer: value => isEmptyString(value) ? [] : cslToArray(value),
      },
    ]
  }
]
```

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

### Plugin vs Function

The plugin hooks into Gatsby's `onCreateNode` life cycle hook and will check the node it receives against an array of descriptors you provide. Each descriptor must provide a predicate - a function that looks at the node and decides whether the descriptor should be used to transform it. For example we might want to check if the node is Markdown node, or if it represents a file from a particular directory. 

If a descriptor's predicate returns true, the descriptor will be used to create new fields on that node. 

Here is an example of a list of descriptors: 

```javaScript
[
  {
    predicate: isMarkdownNode,
    fields: [
      {
        name: 'title',
        validator: isString,
        transformer: preventOrphans,
      },
      {
        name: 'date',
        defaultValue: dateToday,
        validator: isValidDate,
      }
    ]
  }
]
```

## Overview

`gatsby-plugin-node-fields` can be used as a function or as a plugin. It allows you to describe any values on a node should be transformed into fields on the same node. It is particularly useful with Markdown nodes' `frontmatter` fields, but you can use it with any values on a node. 

I have found that mixing queries for values stored in a node's `frontmatter` with queries for values stored in generated fields is uneven and confusing, so I now transfer all values that I will use in the UI over to fields. This transfer gives us the opportunity to do a number of important things:

- set a default value 
- validate a value
- transform a value

### Validation

Your descriptors will be validated against a schema when first used with useful error messages if you have added an invalid field or the value of required field is invalid or missing.

### Descriptors

A descriptor decides if a node should have fields added to it, and describes how these new fields should be created. Each descriptor is an object with two required fields:

#### *predicate* [function] 

A function that receives the newly created node as its single argument and returns `true` if the descriptor should apply to that node and `false` if it doesn't. Multiple descriptors can be applied to the same node if their predicates return true. 

#### *fields* [array] 

An array of objects representing fields that will be created on the node. Each object comprises of a set of keys and values that describe the creation process of a new field. You can use as few or as many keys as needed. For example if all you want to do is set a default value you could use only the `name` and `defaultValue` keys:

```javaScript
{
  name: 'example',
  defaultValue: 'Unknown',
}
```

### Fields

A field can contain one or more of the following keys that describe which fields it should add. You can perform a one-to-one, many-to-one, or one-to-many mapping between values and fields. The order in which these fields are used is

- `getter` or `name`
- `defaultValue`
- `validator`
- `transformer`
- `setter` or `name`

#### *name* [string] 

A `name` field represents the name of the field that will be created. If no `getter` field is present on the descriptor, it will also be used to access a value on the node. For example if the `name` is 'alpha', it will create a field on the node called 'alpha'. If no `getter` field is present on the descriptor is will try and get the value for this field from `node.alpha`. 

#### *getter* [function(node, context)]

A `getter` is a function that gets the value or values from the node. If a `getter` is not defined and a `name` is defined, `node[name]` will be used in its place.

A simple getter might look like:

```javaScript
node => node.frontmatter.title
```

You could also pull the value from a config object or anywhere else you like.

#### *defaultValue* [* | function(node, context)] 

A `defaultValue` supplies a value in instances where no value exists on the node, or no means of getting a value has been defined on the descriptor. For example if only a `name` was defined and there is no prop on the node with that name, if a `getter` was defined but didn't return any value(s), or if neither a `name` or a `getter` were defined. If `defaultValue` is a function it should return a default value. If the value of `defaultValue` is not a function, that value will be used as the default value.

For example you could use an alternative node value if the current value is nil:

```javaScript
node => node.someOtherValue
```

#### *validator* [function(value, node, context)]

A `validator` is just a predicate that receives the value and returns true or false, depending if it deems it to be valid or not. For example we might have a descriptor that has looked up `node.Front Matter.slug`, but there is no slug defined, we use a sanitised version of the title instead:

```javaScript
value => isValidDate(value)
```


#### *transformer* [function(value, node, context)]

A `transformer` transforms the value in some way. For example it might run the value through a function that cleans it up or formats it. A transformer function will be called with three arguments: the value, the node and the context, if defined.

```javaScript
value => preventOrphans(value)
```


#### *setter* [function(value, node, context, createNodeField)]

A *setter* defines how the value(s) are translated to fields. If no `setter` is defined, the *name* field will be used to create a field of that name using Gatsby's `createNodeField` , however using a `setter` function allows more flexibility. For example a value might be an object and we might want to transfer its values to multiple fields. A `setter` will receive three arguments: the value, `createNodeField` and any context. If you define a setter, that setter is responsible for using `createNodeField` to create fields.

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
attachFields(node, createNodeField, descriptors, context)
```

## Maintenance

Gatsby doesn't support ES6 imports, so we need to compile our `./src` to `./lib`, then reference the compiled file from `gatsby-node.js`.

### Tests

Tests are written with Jest:

```bash
yarn test
```
