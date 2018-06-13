const {
  isNil,
  apply,
  identity,
  __,
  ifElse,
  forEach,
  curry,
  prop,
  filter,
  applyTo,
  pipe,
} = require(`ramda`)

const { isFunction, isNotEmpty } = require(`ramda-adjunct`)

const throwUndefinedFieldError = fieldName => {
  throw new Error(
    `Required Field '${fieldName}' was nil. Did you mean to set a default value`
  )
}

const getDefaultValue = (node, context, descriptor) =>
  ifElse(isFunction, apply(__, [node, context]), identity)(descriptor)

const attachFieldToNode = curry(
  (node, createNodeField, context, descriptor) => {
    const fieldName = descriptor.name
    const fieldValue = descriptor.getter
      ? descriptor.getter(node)
      : getDefaultValue(node, context, descriptor.default)

    if (isNil(fieldValue) && node.isRequired) {
      throwUndefinedFieldError(fieldName)
    }

    const value = descriptor.transformer
      ? descriptor.transformer(fieldValue, node, context)
      : fieldValue

    createNodeField({
      node,
      name: fieldName,
      value,
    })
  }
)

const attachFieldsToNode = curry(
  (node, createNodeField, context, descriptor) => {
    forEach(
      attachFieldToNode(node, createNodeField, context),
      descriptor.fields
    )
  }
)

const appliesToNode = curry((value, descriptor) =>
  pipe(
    prop(`predicate`),
    applyTo(value)
  )(descriptor)
)

const attachFields = (node, createNodeField, descriptors = {}, context) => {
  const descriptorsForNode = filter(appliesToNode(node), descriptors)

  if (isNotEmpty(descriptorsForNode)) {
    forEach(
      attachFieldsToNode(node, createNodeField, context),
      descriptorsForNode
    )
  }
}

module.exports = attachFields
