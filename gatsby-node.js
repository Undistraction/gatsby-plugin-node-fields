'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _attachFields = require('./attachFields');

var _attachFields2 = _interopRequireDefault(_attachFields);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var onCreateNode = function onCreateNode(_ref, _ref2) {
  var node = _ref.node,
      boundActionCreators = _ref.boundActionCreators;
  var context = _ref2.context,
      descriptors = _ref2.descriptors;
  var createNodeField = boundActionCreators.createNodeField;

  if (descriptors) {
    (0, _attachFields2.default)(node, createNodeField, descriptors, context);
  }
};

exports.default = onCreateNode;