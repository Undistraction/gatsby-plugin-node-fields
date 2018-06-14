'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var field = _joi2.default.object().keys({
  name: _joi2.default.string(),
  getter: _joi2.default.func(),
  default: _joi2.default.any(),
  validator: _joi2.default.func(),
  transformer: _joi2.default.func(),
  setter: _joi2.default.func()
}).or('name', 'setter');

var descriptor = _joi2.default.object().keys({
  predicate: _joi2.default.func().required(),
  fields: _joi2.default.array().items(field).required()
});

var schema = _joi2.default.array().items(descriptor).required();

exports.default = schema;