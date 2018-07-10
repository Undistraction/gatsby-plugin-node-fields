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

const attachFieldToNode = curry((node, createNodeField, context, fields) => {
  const { name, getter, defaultValue, validator, transformer, setter } = fields

  let fieldValue = getter ? getter(node, context) : node[name]

  if (isUndefined(fieldValue)) {
    fieldValue = getDefaultValue(node, context, defaultValue)
  }

  if (validator && !validator(fieldValue, node, context)) {
    throwInvalidFieldError(name, fieldValue)
  }

  const value = transformer
    ? transformer(fieldValue, node, context)
    : fieldValue

  if (setter) {
    setter(value, node, context, createNodeField)
  } else {
    createNodeField({
      node,
      name,
      value,
    })
  }
})

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
