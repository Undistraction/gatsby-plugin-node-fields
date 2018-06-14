'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _errors = require('./errors');

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var validateDescriptors = function validateDescriptors(descriptors) {
  _joi2.default.validate(descriptors, _schema2.default, { convert: false }, function (error, value) {
    if (error) {
      (0, _errors.throwSchemaValidationError)(error);
    }
    return value;
  });
};

exports.default = validateDescriptors;