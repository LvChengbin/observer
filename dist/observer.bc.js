(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Observer = factory());
}(this, (function () { 'use strict';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var isNumber = (function (n) {
  var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if ({}.toString.call(n).toLowerCase() === '[object number]') {
    return true;
  }

  if (strict) return false;
  return !isNaN(parseFloat(n)) && isFinite(n) && !/\.$/.test(n);
});

var isString = (function (str) {
  return typeof str === 'string' || str instanceof String;
});

var isInteger = (function (n) {
  var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (isNumber(n, true)) return n % 1 === 0;
  if (strict) return false;

  if (isString(n)) {
    if (n === '-0') return true;
    return n.indexOf('.') < 0 && String(parseInt(n)) === n;
  }

  return false;
});

var isAsyncFunction = (function (fn) {
  return {}.toString.call(fn) === '[object AsyncFunction]';
});

var isFunction = (function (fn) {
  return {}.toString.call(fn) === '[object Function]' || isAsyncFunction(fn);
});

var isRegExp = (function (reg) {
  return {}.toString.call(reg) === '[object RegExp]';
});

var EventEmitter =
/*#__PURE__*/
function () {
  function EventEmitter() {
    _classCallCheck(this, EventEmitter);

    this.__listeners = new Map();
  }

  _createClass(EventEmitter, [{
    key: "alias",
    value: function alias(name, to) {
      this[name] = this[to].bind(this);
    }
  }, {
    key: "on",
    value: function on(evt, handler) {
      var listeners = this.__listeners;
      var handlers = listeners.get(evt);

      if (!handlers) {
        handlers = new Set();
        listeners.set(evt, handlers);
      }

      handlers.add(handler);
      return this;
    }
  }, {
    key: "once",
    value: function once(evt, handler) {
      var _this = this;

      var _handler = function _handler() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        handler.apply(_this, args);

        _this.removeListener(evt, _handler);
      };

      return this.on(evt, _handler);
    }
  }, {
    key: "removeListener",
    value: function removeListener(evt, handler) {
      var listeners = this.__listeners;
      var handlers = listeners.get(evt);
      handlers && handlers.delete(handler);
      return this;
    }
  }, {
    key: "emit",
    value: function emit(evt) {
      var _this2 = this;

      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var handlers = this.__listeners.get(evt);

      if (!handlers) return false;
      handlers.forEach(function (handler) {
        return handler.call.apply(handler, [_this2].concat(args));
      });
    }
  }, {
    key: "removeAllListeners",
    value: function removeAllListeners(rule) {
      var checker;

      if (isString(rule)) {
        checker = function checker(name) {
          return rule === name;
        };
      } else if (isFunction(rule)) {
        checker = rule;
      } else if (isRegExp(rule)) {
        checker = function checker(name) {
          rule.lastIndex = 0;
          return rule.test(name);
        };
      }

      var listeners = this.__listeners;
      listeners.forEach(function (value, key) {
        checker(key) && listeners.delete(key);
      });
      return this;
    }
  }]);

  return EventEmitter;
}();

var isPromise = (function (p) {
  return p && isFunction(p.then);
});

var eventcenter = new EventEmitter();
var collector = {
  records: [],
  collecting: false,
  start: function start() {
    this.records = [];
    this.collecting = true;
  },
  stop: function stop() {
    this.collecting = false;
    return this.records;
  },
  add: function add(data) {
    this.collecting && this.records.push(data);
  }
};
function isSubset(obj, container) {
  if (!obj || _typeof(obj) !== 'object') return false;

  for (var prop in container) {
    var item = container[prop];

    if (item === obj) {
      return true;
    }

    if (item && _typeof(item) === 'object') {
      var res = isSubset(obj, item);

      if (res) {
        return true;
      }
    }
  }

  return false;
}

var ec = new EventEmitter();
/**
 * caches for storing expressions.
 * Map( {
 *      expression : fn
 * } )
 */

var caches = new Map();
/**
 * for storing the old values of each expression.
 * Map( {
 *      observer : Map( {
 *          expression/function : value
 *      } )
 * } )
 */

var values = new Map();
/**
 * a Set for storing all callback functions
 */

var callbacks = new Set();
/**
 * a map for storing the relations between observers, expressions, setters, handlers and callbacks.
 * Map( {
 *      observer : Map( {
 *          expression/function : Map( {
 *              handler : [ { setter, callback } ]
 *          } )
 *      } )
 * } );
 */

var handlers = new Map();
/**
 * To do some preparations while adding a new observer.
 */

eventcenter.on('add-observer', function (observer) {
  if (!values.get(observer)) {
    values.set(observer, new Map());
  }

  if (!handlers.get(observer)) {
    handlers.set(observer, new Map());
  }
});
/**
 * Processes after deleting an observer.
 */

eventcenter.on('destroy-observer', function (observer) {
  var map = handlers.get(observer);
  map.forEach(function (hmap) {
    hmap.forEach(function (value) {
      if (!value.length) return;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _item = _step.value;
          ec.removeListener(_item.setter, _item.callback);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      callbacks.delete(value[0].callback);
    });
  });
  handlers.set(observer, new Map());
  values.set(observer, new Map());
});
/**
 * while setting new data into an object in an observer, or deleting properties of objects in observers,
 * all callback function should be executed again to check if the changes would effect any expressions.
 */

eventcenter.on('set-value', function () {
  callbacks.forEach(function (cb) {
    return cb();
  });
});
/**
 * to delete relevent data of a setter of an observer, for releasing useless memory.
 */

var deleteSetterFromObserver = function deleteSetterFromObserver(observer, setter) {
  var ob = handlers.get(observer);
  if (!ob) return;
  ob.forEach(function (val) {
    val.forEach(function (value) {
      for (var i = 0, l = value.length; i < l; i += 1) {
        var item = value[i];

        if (item.setter === setter) {
          ec.removeListener(setter, item.callback);
          callbacks.delete(item.callback);
          value.splice(i--, 1);
          l--;
        }
      }
    });
  });
};
/**
 * to remove useless listeners for release memory.
 */


var gc = function gc(obj, keys) {
  if (!obj || _typeof(obj) !== 'object') return;
  handlers.forEach(function (v, observer) {
    if (isSubset(obj, observer)) return;

    if (!keys) {
      keys = Object.keys(obj);
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _key = _step2.value;
        var descriptor = Object.getOwnPropertyDescriptor(obj, _key);
        var setter = descriptor && descriptor.set;
        if (!setter) continue;
        deleteSetterFromObserver(observer, setter);
        var item = obj[_key];

        if (item && _typeof(item) === 'object') {
          gc(item);
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  });
};

eventcenter.on('overwrite-object', function (val, old) {
  gc(old);
});
eventcenter.on('delete-property', function (deleted, setter) {
  callbacks.forEach(function (cb) {
    return cb();
  });
  setter && handlers.forEach(function (v, observer) {
    deleteSetterFromObserver(observer, setter);
  });
  gc(deleted);
});
/**
 * @function expression
 * To convert the expression to a function.
 *
 * @param {Function|String} exp
 */

function expression(exp) {
  return new Function('s', 'try{with(s)return ' + exp + '}catch(e){return null}');
}
/**
 * @function setValue
 * To store a new value for an expression of an observer and to return the old value
 *
 * @param {Observer} observer
 * @param {Function|String} exp
 * @param {*} value
 */


function setValue(observer, exp, value) {
  var oldvalue;
  var map = values.get(observer);
  oldvalue = map.get(exp);

  if (value !== oldvalue) {
    map.set(exp, value);
  }

  return oldvalue;
}

function setHandler(observer, exp, handler, setter, callback) {
  var expressions = handlers.get(observer);
  var map = expressions.get(exp);

  if (!map) {
    map = new Map();
    map.set(handler, [{
      setter: setter,
      callback: callback
    }]);
    expressions.set(exp, map);
    return;
  }

  var list = map.get(handler);

  if (!list) {
    map.set(handler, [{
      setter: setter,
      callback: callback
    }]);
  }

  var exists = false;
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = list[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _item2 = _step3.value;

      if (_item2.setter === setter && _item2.callback === callback) {
        exists = true;
        break;
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  if (!exists) {
    list.push({
      setter: setter,
      callback: callback
    });
  }
}
/**
 * @function watch
 * To watch changes of an expression or a function of an observer.
 */


function watch(observer, exp, handler) {
  var _cb2, setters, fn;

  if (isFunction(exp)) {
    fn = exp;

    _cb2 = function cb() {
      collector.start();
      var value = fn(observer);
      var setters = collector.stop();
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = setters[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _setter = _step4.value;
          ec.on(_setter, _cb2);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      if (isPromise(value)) {
        value.then(function (val) {
          var oldvalue = setValue(observer, fn, val);

          if (oldvalue !== val) {
            handler(val, oldvalue, observer);
          }
        });
      } else {
        var oldvalue = setValue(observer, fn, value);

        if (oldvalue !== value) {
          handler(value, oldvalue, observer);
        }
      }
    };
  } else {
    fn = caches.get(exp);

    if (!fn) {
      fn = expression(exp);
      caches.set(exp, fn);
    }

    _cb2 = function _cb() {
      var value;
      collector.start();
      value = fn(observer);
      var setters = collector.stop();
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = setters[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _setter2 = _step5.value;
          ec.on(_setter2, _cb2);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      var oldvalue = setValue(observer, exp, value);

      if (oldvalue !== value) {
        handler(value, oldvalue, observer, exp);
      }
    };
  }

  collector.start();
  var value = fn(observer);
  setters = collector.stop();

  if (isPromise(value)) {
    value.then(function (val) {
      return setValue(observer, exp, val);
    });
  } else {
    setValue(observer, exp, value);
  }
  /**
   * add the callback function to callbacks map, so that while changing data with Observer.set or Observer.delete all the callback functions should be executed.
   */


  callbacks.add(_cb2);
  /**
   * while start to watch a non-exists path in an observer,
   * no setters would be collected by collector, and it would make an lonely callback function in callbacks map
   * which cannot be found by handler, so, it cannot be removed while calling Observer.unwatch.
   * To add a handler with its setter is null can resolve this issue.
   */

  setHandler(observer, exp, handler, null, _cb2);
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = setters[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var _setter3 = _step6.value;
      ec.on(_setter3, _cb2);
      setHandler(observer, exp, handler, _setter3, _cb2);
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }
}

function unwatch(observer, exp, handler) {
  var map = handlers.get(observer);
  if (!map) return;
  map = map.get(exp);
  if (!map) return;
  var list = map.get(handler);
  if (!list) return;
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = list[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var _item3 = _step7.value;
      ec.removeListener(_item3.setter, _item3.callback);
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
        _iterator7.return();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
    }
  }

  map.delete(handler);
  callbacks.delete(list[0].callback);
}

function calc(observer, exp) {
  return expression(exp)(observer);
}

/** 
 * @file to convert an object to an observer instance.
 */

var getKeys = Object.keys;
var isArray = Array.isArray;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var defineProperty = Object.defineProperty;
var setPrototypeOf = Object.setPrototypeOf;
var proto = Array.prototype;
var arrMethods = Object.create(proto);
/**
 * methods which would mutate the array on which it is called.
 *
 * Array.prototype.fill
 * Array.prototype.push
 * Array.prototype.pop
 * Array.prototype.shift
 * Array.prototype.unshift
 * Array.prototype.splice
 * Array.prototype.sort
 * Array.prototype.reverse
 */

['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill'].forEach(function (method) {
  var original = proto[method];
  defineProperty(arrMethods, method, {
    enumerable: false,
    writable: true,
    configurable: true,
    value: function value() {
      var args = Array.prototype.slice.call(arguments);
      var result = original.apply(this, args);
      var inserted, deleted;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
          deleted = result;
          break;

        case 'fill':
          inserted = args[0];
          break;

        case 'pop':
        case 'shift':
          deleted = [result];
          break;
      }

      if (deleted) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = deleted[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _item = _step.value;

            if (_item && _typeof(_item) === 'object') {
              eventcenter.emit('delete-property', _item);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      if (inserted) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = inserted[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _item3 = _step2.value;

            if (_item3 && _typeof(_item3) === 'object') {
              traverse(_item3);
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      this.__fake_setter ? ec.emit(this.__fake_setter) : ec.emit(this.__setter);
      return result;
    }
  });
  defineProperty(arrMethods, '$set', {
    enumerable: false,
    writable: true,
    configurable: true,
    value: function value(i, v) {
      if (i >= this.length) {
        this.length = +i + 1;
      }

      return this.splice(i, 1, v)[0];
    }
  });
  defineProperty(arrMethods, '$get', {
    enumerable: false,
    writable: true,
    configurable: true,
    value: function value(i) {
      var setter = this.__fake_setter;
      setter && collector.add(setter);
      return this[i];
    }
  });
  defineProperty(arrMethods, '$length', {
    enumerable: false,
    writable: true,
    configurable: true,
    value: function value(i) {
      this.length = i;
      this.__fake_setter ? ec.emit(this.__fake_setter) : ec.emit(this.__setter);
    }
  });
});

function isObserverSetter(func) {
  return func.name === 'OBSERVER_SETTER' || /^function\s+OBSERVER_SETTER\(\)/.test(func.toString());
}
/**
 * @function translate
 * To translate an property of an object to GETTER and SETTER.
 *
 * @param {Object} obj The object which will be translated
 * @param {String} key The name of the property
 * @param {*} val The value of the property
 * @param {String} path The path in the observer of the property
 * @param {Observer} observer
 */


function translate(obj, key, val) {
  var descriptor = getOwnPropertyDescriptor(obj, key);
  /**
   * if the configurable of the property is false,
   * the property cannot be translated
   */

  if (descriptor && !descriptor.configurable) {
    return;
  }

  var setter = descriptor && descriptor.set;
  /**
   * The property has already transformed by Observer.
   * to add the observer and path into the map.
   */

  if (setter && isObserverSetter(setter)) {
    /**
     * while translating a property of an object multiple times with different values,
     * The same setter should be used but to set the value to the new value.
     */
    return obj[key] = val;
  }

  var getter = descriptor && descriptor.get;

  var set = function OBSERVER_SETTER(v) {
    var value = getter ? getter.call(obj) : val;
    /**
     * Setting the same value will not call the setter.
     */

    if (v === value) return;

    if (setter) {
      setter.call(obj, v);
    } else {
      val = v;
      /**
       * if the new value is an object, to set the new value with Observer.set method.
       * it should be set to all observers which are using this object.
       */

      if (v && _typeof(v) === 'object') {
        traverse(v);
      }

      if (value && _typeof(value) === 'object') {
        eventcenter.emit('overwrite-object', v, value);
      }
    }

    ec.emit(set);
  };

  var get = function OBSERVER_GETTER() {
    collector.add(set);
    return getter ? getter.call(obj) : val;
  };

  defineProperty(obj, key, {
    enumerable: descriptor ? descriptor.enumerable : true,
    configurable: true,
    set: set,
    get: get
  });

  if (isArray(val)) {
    defineProperty(val, '__setter', {
      enumerable: false,
      writable: true,
      configurable: true,
      value: set
    });
  }
}
/**
 * @function traverse
 * To traverse and translate an object.
 *
 * @param {Object} obj
 * @param {Observer} observer
 * @param {String} base
 */


function traverse(obj) {
  var isarr = isArray(obj);

  if (isarr) {
    setPrototypeOf(obj, arrMethods);

    for (var i = 0, l = obj.length; i < l; i += 1) {
      var item = obj[i];

      if (item && _typeof(item) === 'object') {
        traverse(item);
      }
    }
  }

  var keys = getKeys(obj);
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _key = _step3.value;
      var val = obj[_key]; // to skip translating the indexes of array

      if (isarr && isInteger(_key) && _key >= 0 && _key < obj.length) continue;
      translate(obj, _key, val);

      if (val && _typeof(val) === 'object') {
        traverse(val);
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
}

var Observer = {
  create: function create(obj, proto) {
    if (obj.__observer) return obj;
    defineProperty(obj, '__observer', {
      enumerable: false,
      writable: true,
      configurable: true,
      value: true
    });

    if (isArray(obj)) {
      defineProperty(obj, '__fake_setter', {
        enumerable: false,
        writable: true,
        configurable: true,
        value: function OBSERVER_SETTER() {}
      });
    }

    traverse(obj);

    if (proto) {
      setPrototypeOf(obj, proto);
    }

    eventcenter.emit('add-observer', obj);
    return obj;
  },

  /**
   * @method set
   * To set a new property to an object
   *
   * @param {Object} obj
   * @param {String} key
   * @param {*} value
   */
  set: function set(obj, key, value) {
    /**
     * if the object is an array and the key is a integer, set the value with [].$set
     */
    if (isArray(obj) && isInteger(key, true)) {
      return obj.$set(key, value);
    }

    var old = obj[key];

    if (old && _typeof(old) === 'object') {
      ec.emit('overwrite-object', value, old);
    }

    var isobj = value && _typeof(value) === 'object';
    /**
     * to add the property to the specified object and to translate it to the format of observer.
     */

    translate(obj, key, value);
    /**
     * if the value is an object, to traverse the object with all paths in all observers
     */

    if (isobj) {
      traverse(value);
    }

    eventcenter.emit('set-value', obj, key, value, old);
  },

  /**
   * @function delete
   * To delete an property from
   *
   * - delete all relevant data, storing in each map, for both the specified property and its sub/descandant object.
   * -
   */
  delete: function _delete(obj, key) {
    var old = obj[key];
    var descriptor = Object.getOwnPropertyDescriptor(obj, key);
    var setter = descriptor && descriptor.set;
    delete obj[key];
    eventcenter.emit('delete-property', old, setter);
  },

  /**
   * @function translated 
   * to check if the property in the object has been translated to observer setter and getter
   *
   * @param {Object|Array} obj
   * @param {String|Integer} key The property name
   *
   */
  translated: function translated(obj, key) {
    var descriptor = Object.getOwnPropertyDescriptor(obj, key);

    if (descriptor && !descriptor.configurable) {
      return false;
    }

    var setter = descriptor && descriptor.set;
    return !!(setter && isObserverSetter(setter));
  },
  is: function is(observer) {
    return observer.__observer || false;
  },
  watch: function watch$$1(observer, exp, handler) {
    watch(observer, exp, handler);
  },
  unwatch: function unwatch$$1(observer, exp, handler) {
    unwatch(observer, exp, handler);
  },
  calc: function calc$$1(observer, exp) {
    return calc(observer, exp);
  },
  replace: function replace(observer, data) {
    var _arr = Object.keys(observer);

    for (var _i = 0; _i < _arr.length; _i++) {
      var key = _arr[_i];

      if (!data.hasOwnProperty(key)) {
        Observer.delete(observer, key);
      }
    }

    var _arr2 = Object.keys(data);

    for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
      var _key2 = _arr2[_i2];

      if (observer.hasOwnProperty(_key2)) {
        observer[_key2] = data[_key2];
      } else {
        Observer.set(observer, _key2, data[_key2]);
      }
    }

    return observer;
  },
  destroy: function destroy(observer) {
    eventcenter.emit('destroy-observer', observer);
  }
};

return Observer;

})));
