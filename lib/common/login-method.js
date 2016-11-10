"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onLogin = onLogin;
exports.onLogout = onLogout;
exports.resumeLogin = resumeLogin;

var _multiStorage = require("./multi-storage");

var multiStorage = _interopRequireWildcard(_multiStorage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function onLogin(_ref) {
  var id = _ref.id,
      token = _ref.token;

  this.userId = id;
  this.loggedIn = true;

  var promise = void 0;
  if (this.storeToken) {
    promise = multiStorage.set(this.endpoint + "__login_token__", token);
  } else {
    promise = Promise.resolve();
  }
  return promise.then(this.emit.bind(this, "loggedIn", id)).then(function () {
    return { id: id, token: token };
  });
}

function onLogout() {
  this.userId = null;
  this.loggedIn = false;

  var promise = void 0;
  if (this.storeToken) {
    promise = multiStorage.del(this.endpoint + "__login_token__");
  } else {
    promise = Promise.resolve();
  }
  return promise.then(this.emit.bind(this, "loggedOut")).then(function () {
    return null;
  });
}

function resumeLogin(token) {
  var tokenPromise = void 0;
  if (token) {
    tokenPromise = Promise.resolve({ resume: token });
  } else {
    var promise = void 0;
    if (this.storeToken) {
      promise = multiStorage.get(this.endpoint + "__login_token__");
    } else {
      promise = Promise.resolve();
    }
    tokenPromise = promise.then(function (resume) {
      if (!resume) {
        throw new Error("No login token");
      }
      return { resume: resume };
    });
  }
  return tokenPromise.then(this.login.bind(this)).catch(onLogout.bind(this));
}