'use strict';

var _ramda = require('ramda');

var _ramdaAdjunct = require('ramda-adjunct');

var _errors = require('./errors');

var _validateDescriptors = require('./validateDescriptors');

var _validateDescriptors2 = _interopRequireDefault(_validateDescriptors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getDefaultValue = function getDefaultValue(node, context, descriptor) {
  return (0, _ramda.ifElse)(_ramdaAdjunct.isFunction, (0, _ramda.apply)(_ramda.__, [node, context]), _ramda.identity)(descriptor);
};

var attachFieldToNode = (0, _ramda.curry)(function (node, createNodeField, context, descriptor) {
  var fieldName = descriptor.name;
  var fieldValue = descriptor.getter ? descriptor.getter(node, context) : node[fieldName];

  if (!fieldValue) {
    fieldValue = getDefaultValue(node, context, descriptor.defaultValue);
  }

  if (descriptor.validator) {
    var isValid = descriptor.validator(fieldValue, context);
    if (!isValid) {
      (0, _errors.throwInvalidFieldError)(fieldName, fieldValue);
    }
  }

  var value = descriptor.transformer ? descriptor.transformer(node, context, fieldValue) : fieldValue;

  if (descriptor.setter) {
    descriptor.setter(node, context, createNodeField, value);
  } else {
    createNodeField({
      node: node,
      name: fieldName,
      value: value
    });
  }
});

var attachFieldsToNode = (0, _ramda.curry)(function (node, createNodeField, context, descriptor) {
  (0, _ramda.forEach)(attachFieldToNode(node, createNodeField, context), descriptor.fields);
});

var appliesToNode = (0, _ramda.curry)(function (value, descriptor) {
  return (0, _ramda.pipe)((0, _ramda.prop)('predicate'), (0, _ramda.applyTo)(value))(descriptor);
});

var attachFields = function attachFields(node, createNodeField) {
  var descriptors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var context = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  (0, _validateDescriptors2.default)(descriptors);

  var descriptorsForNode = (0, _ramda.filter)(appliesToNode(node), descriptors);

  if ((0, _ramdaAdjunct.isNotEmpty)(descriptorsForNode)) {
    (0, _ramda.forEach)(attachFieldsToNode(node, createNodeField, context), descriptorsForNode);
  }
};

module.exports = attachFields;