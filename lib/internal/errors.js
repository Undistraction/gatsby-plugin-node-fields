"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var ERROR_PREFIX = "[gatsby-plugin-node-fields]";
var INVALID_FIELD_ERROR_PREFIX = "Invalid Field Error";

var throwLibError = function throwLibError(message) {
  throw new Error(ERROR_PREFIX + " " + message);
};

var throwPrefixedError = function throwPrefixedError(prefix, message) {
  return throwLibError(prefix + ": " + message);
};

// eslint-disable-next-line import/prefer-default-export
var throwInvalidFieldError = exports.throwInvalidFieldError = function throwInvalidFieldError(fieldName, fieldValue) {
  throwPrefixedError(INVALID_FIELD_ERROR_PREFIX, "Validator function for field named '" + fieldName + "' returned false for field value '" + fieldValue + "'");
};

var throwSchemaValidationError = exports.throwSchemaValidationError = function throwSchemaValidationError(error) {
  return throwLibError(error.toString());
};