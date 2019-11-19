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
import { isFunction, isNotEmpty, isUndefined } from 'ramda-adjunct'
import { throwInvalidFieldError } from './errors'
import validateDescriptors from './validateDescriptors'

const getDefaultValue = (node, context, boundActionCreators, descriptor) =>
  ifElse(isFunction, apply(__, [node, context, boundActionCreators]), identity)(
    descriptor
  )

const attachFieldToNode = curry(
  (node, boundActionCreators, context, fields) => {
    const {
      name,
      getter,
      defaultValue,
      validator,
      transformer,
      setter,
    } = fields

    let fieldValue = isFunction(getter)
      ? getter(node, context, boundActionCreators)
      : node[name]

    if (isUndefined(fieldValue)) {
      fieldValue = getDefaultValue(
        node,
        context,
        boundActionCreators,
        defaultValue
      )
    }

    if (
      validator &&
      !validator(fieldValue, node, context, boundActionCreators)
    ) {
      throwInvalidFieldError(name, fieldValue)
    }

    const value = isFunction(transformer)
      ? transformer(fieldValue, node, context, boundActionCreators)
      : fieldValue

    if (isFunction(setter)) {
      setter(value, node, context, boundActionCreators)
    } else {
      boundActionCreators.createNodeField({
        node,
        name,
        value,
      })
    }
  }
)

const attachFieldsToNode = curry(
  (node, boundActionCreators, context, descriptor) => {
    forEach(
      attachFieldToNode(node, boundActionCreators, context),
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
  boundActionCreators,
  descriptors = [],
  context = {}
) => {
  validateDescriptors(descriptors)

  const descriptorsForNode = filter(appliesToNode(node), descriptors)

  if (isNotEmpty(descriptorsForNode)) {
    forEach(
      attachFieldsToNode(node, boundActionCreators, context),
      descriptorsForNode
    )
  }
}

module.exports = attachFields
