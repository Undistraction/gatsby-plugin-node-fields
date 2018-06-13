import {
  apply,
  applyTo,
  curry,
  filter,
  forEach,
  identity,
  ifElse,
  isNil,
  pipe,
  prop,
  __,
} from 'ramda'
import { isFunction, isNotEmpty } from 'ramda-adjunct'

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
    let fieldValue

    if (descriptor.getter) fieldValue = descriptor.getter(node)
    if (!fieldValue) {
      fieldValue = getDefaultValue(node, context, descriptor.default)
    }

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
