import {
  apply,
  applyTo,
  curry,
  filter,
  forEach,
  identity,
  ifElse,
  pipe,
  prop,
  __,
} from 'ramda'
import { isFunction, isNotEmpty } from 'ramda-adjunct'
import { throwInvalidFieldError } from './errors'
import validateDescriptors from './validateDescriptors'

const getDefaultValue = (node, context, descriptor) =>
  ifElse(isFunction, apply(__, [node, context]), identity)(descriptor)

const attachFieldToNode = curry(
  (node, createNodeField, context, descriptor) => {
    const fieldName = descriptor.name
    let fieldValue = descriptor.getter
      ? descriptor.getter(node)
      : node[fieldName]

    if (!fieldValue) {
      fieldValue = getDefaultValue(node, context, descriptor.default)
    }

    if (descriptor.validator) {
      const isValid = descriptor.validator(fieldValue)
      if (!isValid) {
        throwInvalidFieldError(fieldName, fieldValue)
      }
    }

    const value = descriptor.transformer
      ? descriptor.transformer(fieldValue, node, context)
      : fieldValue

    if (descriptor.setter) {
      descriptor.setter(node, createNodeField, value)
    } else {
      createNodeField({
        node,
        name: fieldName,
        value,
      })
    }
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

const attachFields = (
  node,
  createNodeField,
  descriptors = [],
  context = {}
) => {
  validateDescriptors(descriptors)

  const descriptorsForNode = filter(appliesToNode(node), descriptors)

  if (isNotEmpty(descriptorsForNode)) {
    forEach(
      attachFieldsToNode(node, createNodeField, context),
      descriptorsForNode
    )
  }
}

module.exports = attachFields
