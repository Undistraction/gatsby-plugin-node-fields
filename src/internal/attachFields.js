import {
  apply,
  flip,
  curry,
  filter,
  forEach,
  identity,
  ifElse,
  pipe,
  prop,
  __,
} from 'ramda'
import { isFunction, isNotEmpty, isUndefined } from 'ramda-adjunct'
import { throwInvalidFieldError } from './errors'
import validateDescriptors from './validateDescriptors'

const applyFlipped = flip(apply)

const getDefaultValue = (node, context, actions, getNode, descriptor) =>
  ifElse(
    isFunction,
    apply(__, [node, context, actions, getNode]),
    identity
  )(descriptor)

const attachFieldToNode = curry((node, actions, getNode, context, fields) => {
  const { name, getter, defaultValue, validator, transformer, setter } = fields

  let fieldValue = isFunction(getter)
    ? getter(node, context, actions, getNode)
    : node[name]

  if (isUndefined(fieldValue)) {
    fieldValue = getDefaultValue(node, context, actions, getNode, defaultValue)
  }

  if (validator && !validator(fieldValue, node, context, actions, getNode)) {
    throwInvalidFieldError(name, fieldValue)
  }

  const value = isFunction(transformer)
    ? transformer(fieldValue, node, context, actions, getNode)
    : fieldValue

  if (isFunction(setter)) {
    setter(value, node, context, actions, getNode)
  } else {
    actions.createNodeField({
      node,
      name,
      value,
    })
  }
})

const attachFieldsToNode = curry(
  (node, actions, getNode, context, descriptor) => {
    forEach(
      attachFieldToNode(node, actions, getNode, context),
      descriptor.fields
    )
  }
)

const appliesToNode = curry((value, getNode, descriptor) =>
  pipe(prop(`predicate`), applyFlipped([value, getNode]))(descriptor)
)

const attachFields = (
  node,
  actions,
  getNode,
  descriptors = [],
  context = {}
) => {
  validateDescriptors(descriptors)

  const descriptorsForNode = filter(appliesToNode(node, getNode), descriptors)

  if (isNotEmpty(descriptorsForNode)) {
    forEach(
      attachFieldsToNode(node, actions, getNode, context),
      descriptorsForNode
    )
  }
}

module.exports = attachFields
