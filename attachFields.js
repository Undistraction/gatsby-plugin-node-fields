"use strict";

var _require = require("ramda"),
    isNil = _require.isNil,
    apply = _require.apply,
    identity = _require.identity,
    __ = _require.__,
    ifElse = _require.ifElse,
    forEach = _require.forEach,
    curry = _require.curry,
    prop = _require.prop,
    filter = _require.filter,
    applyTo = _require.applyTo,
    pipe = _require.pipe;

var _require2 = require("ramda-adjunct"),
    isFunction = _require2.isFunction,
    isNotEmpty = _require2.isNotEmpty;

var throwUndefinedFieldError = function throwUndefinedFieldError(fieldName) {
  throw new Error("Required Field '" + fieldName + "' was nil. Did you mean to set a default value");
};

var getDefaultValue = function getDefaultValue(node, context, descriptor) {
  return ifElse(isFunction, apply(__, [node, context]), identity)(descriptor);
};

var attachFieldToNode = curry(function (node, createNodeField, context, descriptor) {
  var fieldName = descriptor.name;
  var fieldValue = descriptor.getter ? descriptor.getter(node) : getDefaultValue(node, context, descriptor.default);

  if (isNil(fieldValue) && node.isRequired) {
    throwUndefinedFieldError(fieldName);
  }

  var value = descriptor.transformer ? descriptor.transformer(fieldValue, node, context) : fieldValue;

  createNodeField({
    node: node,
    name: fieldName,
    value: value
  });
});

var attachFieldsToNode = curry(function (node, createNodeField, context, descriptor) {
  forEach(attachFieldToNode(node, createNodeField, context), descriptor.fields);
});

var appliesToNode = curry(function (value, descriptor) {
  return pipe(prop("predicate"), applyTo(value))(descriptor);
});

var attachFields = function attachFields(node, createNodeField) {
  var descriptors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var context = arguments[3];

  var descriptorsForNode = filter(appliesToNode(node), descriptors);

  if (isNotEmpty(descriptorsForNode)) {
    forEach(attachFieldsToNode(node, createNodeField, context), descriptorsForNode);
  }
};

module.exports = attachFields;