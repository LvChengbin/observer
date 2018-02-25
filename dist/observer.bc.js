(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Observer = factory());
}(this, (function () { 'use strict';

// @@match logic
require('./_fix-re-wks')('match', 1, function (defined, MATCH, $match) {
  // 21.1.3.11 String.prototype.match(regexp)
  return [function match(regexp) {
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, $match];
});

var dP = require('./_object-dp').f;

var FProto = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name'; // 19.2.4.2 name

NAME in FProto || require('./_descriptors') && dP(FProto, NAME, {
  configurable: true,
  get: function get() {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});

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

// @@replace logic
require('./_fix-re-wks')('replace', 2, function (defined, REPLACE, $replace) {
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return [function replace(searchValue, replaceValue) {
    var O = defined(this);
    var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined ? fn.call(searchValue, O, replaceValue) : $replace.call(String(O), searchValue, replaceValue);
  }, $replace];
});

// @@split logic
require('./_fix-re-wks')('split', 2, function (defined, SPLIT, $split) {
  var isRegExp = require('./_is-regexp');

  var _split = $split;
  var $push = [].push;
  var $SPLIT = 'split';
  var LENGTH = 'length';
  var LAST_INDEX = 'lastIndex';

  if ('abbc'[$SPLIT](/(b)*/)[1] == 'c' || 'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 || 'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 || '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 || '.'[$SPLIT](/()()/)[LENGTH] > 1 || ''[$SPLIT](/.?/)[LENGTH]) {
    var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
    // based on es5-shim implementation, need to rework it

    $split = function $split(separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return []; // If `separator` is not a regex, use native split

      if (!isRegExp(separator)) return _split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.unicode ? 'u' : '') + (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? 4294967295 : limit >>> 0; // Make `global` and avoid `lastIndex` issues by working with a copy

      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var separator2, match, lastIndex, lastLength, i; // Doesn't need flags gy, but they don't hurt

      if (!NPCG) separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);

      while (match = separatorCopy.exec(string)) {
        // `separatorCopy.lastIndex` is not reliable cross-browser
        lastIndex = match.index + match[0][LENGTH];

        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index)); // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
          // eslint-disable-next-line no-loop-func

          if (!NPCG && match[LENGTH] > 1) match[0].replace(separator2, function () {
            for (i = 1; i < arguments[LENGTH] - 2; i++) {
              if (arguments[i] === undefined) match[i] = undefined;
            }
          });
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }

        if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }

      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));

      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    }; // Chakra, V8

  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    $split = function $split(separator, limit) {
      return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
    };
  } // 21.1.3.17 String.prototype.split(separator, limit)


  return [function split(separator, limit) {
    var O = defined(this);
    var fn = separator == undefined ? undefined : separator[SPLIT];
    return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
  }, $split];
});

var _typeof$1 = require("rollupPluginBabelHelpers").typeof;

var global = require('./_global');

var has = require('./_has');

var DESCRIPTORS = require('./_descriptors');

var $export = require('./_export');

var redefine = require('./_redefine');

var META = require('./_meta').KEY;

var $fails = require('./_fails');

var shared = require('./_shared');

var setToStringTag = require('./_set-to-string-tag');

var uid = require('./_uid');

var wks = require('./_wks');

var wksExt = require('./_wks-ext');

var wksDefine = require('./_wks-define');

var enumKeys = require('./_enum-keys');

var isArray = require('./_is-array');

var anObject = require('./_an-object');

var isObject = require('./_is-object');

var toIObject = require('./_to-iobject');

var toPrimitive = require('./_to-primitive');

var createDesc = require('./_property-desc');

var _create = require('./_object-create');

var gOPNExt = require('./_object-gopn-ext');

var $GOPD = require('./_object-gopd');

var $DP = require('./_object-dp');

var $keys = require('./_object-keys');

var gOPD = $GOPD.f;
var dP$1 = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;

var _stringify = $JSON && $JSON.stringify;

var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild; // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP$1({}, 'a', {
    get: function get() {
      return dP$1(this, 'a', {
        value: 7
      }).a;
    }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP$1(it, key, D);
  if (protoDesc && it !== ObjectProto) dP$1(ObjectProto, key, protoDesc);
} : dP$1;

var wrap = function wrap(tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);

  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && _typeof$1($Symbol.iterator) == 'symbol' ? function (it) {
  return _typeof$1(it) == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);

  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP$1(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, {
        enumerable: createDesc(0, false)
      });
    }

    return setSymbolDesc(it, key, D);
  }

  return dP$1(it, key, D);
};

var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;

  while (l > i) {
    $defineProperty(it, key = keys[i++], P[key]);
  }

  return it;
};

var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};

var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};

var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;

  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  }

  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;

  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  }

  return result;
}; // 19.4.1.1 Symbol([description])


if (!USE_NATIVE) {
  $Symbol = function _Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);

    var $set = function $set(value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };

    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, {
      configurable: true,
      set: $set
    });
    return wrap(tag);
  };

  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });
  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {
  Symbol: $Symbol
});

for (var es6Symbols = // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'.split(','), j = 0; es6Symbols.length > j;) {
  wks(es6Symbols[j++]);
}

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) {
  wksDefine(wellKnownSymbols[k++]);
}

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function _for(key) {
    return has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');

    for (var key in SymbolRegistry) {
      if (SymbolRegistry[key] === sym) return key;
    }
  },
  useSetter: function useSetter() {
    setter = true;
  },
  useSimple: function useSimple() {
    setter = false;
  }
});
$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
}); // 24.3.2 JSON.stringify(value [, replacer [, space]])

$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol(); // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols

  return _stringify([S]) != '[null]' || _stringify({
    a: S
  }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    var args = [it];
    var i = 1;
    var replacer, $replacer;

    while (arguments.length > i) {
      args.push(arguments[i++]);
    }

    $replacer = replacer = args[1];
    if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined

    if (!isArray(replacer)) replacer = function replacer(key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
}); // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)

$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf); // 19.4.3.5 Symbol.prototype[@@toStringTag]

setToStringTag($Symbol, 'Symbol'); // 20.2.1.9 Math[@@toStringTag]

setToStringTag(Math, 'Math', true); // 24.3.3 JSON[@@toStringTag]

setToStringTag(global.JSON, 'JSON', true);

var $iterators = require('./es6.array.iterator');

var getKeys = require('./_object-keys');

var redefine$1 = require('./_redefine');

var global$1 = require('./_global');

var hide = require('./_hide');

var Iterators = require('./_iterators');

var wks$1 = require('./_wks');

var ITERATOR = wks$1('iterator');
var TO_STRING_TAG = wks$1('toStringTag');
var ArrayValues = Iterators.Array;
var DOMIterables = {
  CSSRuleList: true,
  // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true,
  // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true,
  // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME$1 = collections[i];
  var explicit = DOMIterables[NAME$1];
  var Collection = global$1[NAME$1];
  var proto = Collection && Collection.prototype;
  var key;

  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME$1);
    Iterators[NAME$1] = ArrayValues;
    if (explicit) for (key in $iterators) {
      if (!proto[key]) redefine$1(proto, key, $iterators[key], true);
    }
  }
}

// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export$1 = require('./_export');

$export$1($export$1.S, 'Object', {
  setPrototypeOf: require('./_set-proto').set
});

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

var strong = require('./_collection-strong');

var validate = require('./_validate-collection');

var SET = 'Set'; // 23.2 Set Objects

module.exports = require('./_collection')(SET, function (get) {
  return function Set() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
  }
}, strong);

var strong$1 = require('./_collection-strong');

var validate$1 = require('./_validate-collection');

var MAP = 'Map'; // 23.1 Map Objects

module.exports = require('./_collection')(MAP, function (get) {
  return function Map() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong$1.getEntry(validate$1(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong$1.def(validate$1(this, MAP), key === 0 ? 0 : key, value);
  }
}, strong$1, true);

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

var callAllCallbacks = function callAllCallbacks() {
  callbacks.forEach(function (cb) {
    return cb();
  });
};

eventcenter.on('set-value', callAllCallbacks);
eventcenter.on('delete-property', callAllCallbacks);
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
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = list[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _item2 = _step2.value;

      if (_item2.setter === setter && _item2.callback === callback) {
        exists = true;
        break;
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
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = setters[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _setter = _step3.value;
          ec.on(_setter, _cb2);
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
    var obj = caches.get(exp);
    var continuous;

    if (!obj) {
      fn = expression(exp);
      continuous = /(&&)|(\|\|)|(\?.+?:)/.test(exp);
      caches.set(exp, {
        fn: fn,
        continuous: continuous
      });
    } else {
      fn = obj.fn;
      continuous = obj.continuous;
    }

    _cb2 = function _cb() {
      var value;

      if (continuous) {
        collector.start();
        value = fn(observer);

        var _setters = collector.stop();

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = _setters[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _setter2 = _step4.value;
            ec.on(_setter2, _cb2);
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
      } else {
        value = fn(observer);
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
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = setters[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var _setter3 = _step5.value;
      ec.on(_setter3, _cb2);
      setHandler(observer, exp, handler, _setter3, _cb2);
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
}

function unwatch(observer, exp, handler) {
  var map = handlers.get(observer);
  if (!map) return;
  map = map.get(exp);
  if (!map) return;
  var list = map.get(handler);
  if (!list) return;
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = list[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var _item3 = _step6.value;
      ec.removeListener(_item3.setter, _item3.callback);
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

  callbacks.delete(list[0].callback);
}

/** 
 * @file to convert an object to an observer instance.
 */

var getKeys$1 = Object.keys;
var isArray$1 = Array.isArray;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var defineProperty = Object.defineProperty;
var setPrototypeOf = Object.setPrototypeOf;
var proto$1 = Array.prototype;
var arrMethods = Object.create(proto$1);
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
  var original = proto$1[method];
  defineProperty(arrMethods, method, {
    enumerable: false,
    writable: true,
    configurable: true,
    value: function value() {
      var args = Array.prototype.slice.call(arguments);
      var result = original.apply(this, args);
      var inserted;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
          break;

        case 'fill':
          inserted = args[0];
      }

      if (inserted) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = inserted[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _item = _step.value;

            if (_item && _typeof(_item) === 'object') {
              traverse(_item);
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
        Observer.set(obj, key, v);
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

  if (isArray$1(val)) {
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
  var isarr = isArray$1(obj);

  if (isarr) {
    setPrototypeOf(obj, arrMethods);

    for (var i = 0, l = obj.length; i < l; i += 1) {
      var item = obj[i];

      if (item && _typeof(item) === 'object') {
        traverse(item);
      }
    }
  }

  var keys = getKeys$1(obj);
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _key = _step2.value;
      var val = obj[_key]; // to skip translating the indexes of array

      if (isarr && isInteger(_key) && _key >= 0 && _key < obj.length) continue;
      translate(obj, _key, val);

      if (val && _typeof(val) === 'object') {
        traverse(val);
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

var Observer = {
  create: function create(obj, proto) {
    if (obj.__observer) return obj;
    defineProperty(obj, '__observer', {
      enumerable: false,
      writable: true,
      configurable: true,
      value: true
    });

    if (isArray$1(obj)) {
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
    if (isArray$1(obj) && isInteger(key, true)) {
      return obj.$set(key, value);
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

    eventcenter.emit('set-value', obj, key, value);
  },

  /**
   * @function delete
   * To delete an property from
   *
   * - delete all relevant data, storing in each map, for both the specified property and its sub/descandant object.
   * -
   */
  delete: function _delete(obj, key) {
    delete obj[key];
    eventcenter.emit('delete-property', obj, key);
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
  destroy: function destroy(observer) {
    eventcenter.emit('destroy-observer', observer);
  }
};

return Observer;

})));
