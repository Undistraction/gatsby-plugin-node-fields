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

var attachFieldToNode = (0, _ramda.curry)(function (node, createNodeField, context, fields) {
  var name = fields.name,
      getter = fields.getter,
      defaultValue = fields.defaultValue,
      validator = fields.validator,
      transformer = fields.transformer,
      setter = fields.setter;


  var fieldValue = getter ? getter(node, context) : node[name];

  if (!fieldValue) {
    fieldValue = getDefaultValue(node, context, defaultValue);
  }

  if (validator && !validator(fieldValue, node, context)) {
    (0, _errors.throwInvalidFieldError)(name, fieldValue);
  }

  var value = transformer ? transformer(fieldValue, node, context) : fieldValue;

  if (setter) {
    setter(value, node, context, createNodeField);
  } else {
    createNodeField({
      node: node,
      name: name,
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