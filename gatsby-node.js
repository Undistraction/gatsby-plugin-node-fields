'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _attachFields = require('./attachFields');

var _attachFields2 = _interopRequireDefault(_attachFields);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var onCreateNode = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref, _ref2) {
    var node = _ref.node,
        boundActionCreators = _ref.boundActionCreators;
    var context = _ref2.context,
        descriptors = _ref2.descriptors;
    var createNodeField;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createNodeField = boundActionCreators.createNodeField;

            if (descriptors) {
              (0, _attachFields2.default)(node, createNodeField, descriptors, context);
            }

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function onCreateNode(_x, _x2) {
    return _ref3.apply(this, arguments);
  };
}();

exports.default = onCreateNode;