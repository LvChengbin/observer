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

var _isObject = function _isObject(it) {
  return _typeof(it) === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function _anObject(it) {
  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function _fails(exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

var _descriptors = !_fails(function () {
  return Object.defineProperty({}, 'a', {
    get: function get() {
      return 7;
    }
  }).a != 7;
});

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _global = createCommonjsModule(function (module) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self // eslint-disable-next-line no-new-func
  : Function('return this')();
  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var document = _global.document; // typeof document.createElement is 'object' in old IE

var is = _isObject(document) && _isObject(document.createElement);

var _domCreate = function _domCreate(it) {
  return is ? document.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function () {
  return Object.defineProperty(_domCreate('div'), 'a', {
    get: function get() {
      return 7;
    }
  }).a != 7;
});

// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string

var _toPrimitive = function _toPrimitive(it, S) {
  if (!_isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP = Object.defineProperty;
var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if (_ie8DomDefine) try {
    return dP(O, P, Attributes);
  } catch (e) {
    /* empty */
  }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};
var _objectDp = {
  f: f
};

var _propertyDesc = function _propertyDesc(bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide = _descriptors ? function (object, key, value) {
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

_fixReWks('replace', 2, function (defined, REPLACE, $replace) {
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return [function replace(searchValue, replaceValue) {
    var O = defined(this);
    var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined ? fn.call(searchValue, O, replaceValue) : $replace.call(String(O), searchValue, replaceValue);
  }, $replace];
});

var toString = {}.toString;

var _cof = function _cof(it) {
  return toString.call(it).slice(8, -1);
};

var SHARED = '__core-js_shared__';
var store = _global[SHARED] || (_global[SHARED] = {});

var _shared = function _shared(key) {
  return store[key] || (store[key] = {});
};

var id = 0;
var px = Math.random();

var _uid = function _uid(key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var _wks = createCommonjsModule(function (module) {
  var store = _shared('wks');
  var _Symbol = _global.Symbol;
  var USE_SYMBOL = typeof _Symbol == 'function';

  var $exports = module.exports = function (name) {
    return store[name] || (store[name] = USE_SYMBOL && _Symbol[name] || (USE_SYMBOL ? _Symbol : _uid)('Symbol.' + name));
  };

  $exports.store = store;
});

var MATCH = _wks('match');

var _isRegexp = function _isRegexp(it) {
  var isRegExp;
  return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
};

_fixReWks('split', 2, function (defined, SPLIT, $split) {
  var isRegExp = _isRegexp;
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

var hasOwnProperty = {}.hasOwnProperty;

var _has = function _has(it, key) {
  return hasOwnProperty.call(it, key);
};

var _core = createCommonjsModule(function (module) {
  var core = module.exports = {
    version: '2.5.3'
  };
  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});

var _core_1 = _core.version;

var _redefine = createCommonjsModule(function (module) {
  var SRC = _uid('src');
  var TO_STRING = 'toString';
  var $toString = Function[TO_STRING];
  var TPL = ('' + $toString).split(TO_STRING);

  _core.inspectSource = function (it) {
    return $toString.call(it);
  };

  (module.exports = function (O, key, val, safe) {
    var isFunction = typeof val == 'function';
    if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
    if (O[key] === val) return;
    if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));

    if (O === _global) {
      O[key] = val;
    } else if (!safe) {
      delete O[key];
      _hide(O, key, val);
    } else if (O[key]) {
      O[key] = val;
    } else {
      _hide(O, key, val);
    } // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative

  })(Function.prototype, TO_STRING, function toString() {
    return typeof this == 'function' && this[SRC] || $toString.call(this);
  });
});

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function _defined(it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

var _fixReWks = function _fixReWks(KEY, length, exec) {
  var SYMBOL = _wks(KEY);
  var fns = exec(_defined, SYMBOL, ''[KEY]);
  var strfn = fns[0];
  var rxfn = fns[1];

  if (_fails(function () {
    var O = {};

    O[SYMBOL] = function () {
      return 7;
    };

    return ''[KEY](O) != 7;
  })) {
    _redefine(String.prototype, KEY, strfn);
    _hide(RegExp.prototype, SYMBOL, length == 2 // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
    // 21.2.5.11 RegExp.prototype[@@split](string, limit)
    ? function (string, arg) {
      return rxfn.call(string, this, arg);
    } // 21.2.5.6 RegExp.prototype[@@match](string)
    // 21.2.5.9 RegExp.prototype[@@search](string)
    : function (string) {
      return rxfn.call(string, this);
    });
  }
};

_fixReWks('match', 1, function (defined, MATCH, $match) {
  // 21.1.3.11 String.prototype.match(regexp)
  return [function match(regexp) {
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, $match];
});

var dP$1 = _objectDp.f;
var FProto = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name'; // 19.2.4.2 name

NAME in FProto || _descriptors && dP$1(FProto, NAME, {
  configurable: true,
  get: function get() {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});

var _aFunction = function _aFunction(it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

var _ctx = function _ctx(fn, that, length) {
  _aFunction(fn);
  if (that === undefined) return fn;

  switch (length) {
    case 1:
      return function (a) {
        return fn.call(that, a);
      };

    case 2:
      return function (a, b) {
        return fn.call(that, a, b);
      };

    case 3:
      return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
  }

  return function ()
  /* ...args */
  {
    return fn.apply(that, arguments);
  };
};

var PROTOTYPE = 'prototype';

var $export = function $export(type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;

  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined; // export native or passed

    out = (own ? target : source)[key]; // bind timers to global for call from export context

    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out; // extend global

    if (target) _redefine(target, key, out, type & $export.U); // export

    if (exports[key] != out) _hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};

_global.core = _core; // type bitmap

$export.F = 1; // forced

$export.G = 2; // global

$export.S = 4; // static

$export.P = 8; // proto

$export.B = 16; // bind

$export.W = 32; // wrap

$export.U = 64; // safe

$export.R = 128; // real proto method for `library`

var _export = $export;

var _meta = createCommonjsModule(function (module) {
  var META = _uid('meta');
  var setDesc = _objectDp.f;
  var id = 0;

  var isExtensible = Object.isExtensible || function () {
    return true;
  };

  var FREEZE = !_fails(function () {
    return isExtensible(Object.preventExtensions({}));
  });

  var setMeta = function setMeta(it) {
    setDesc(it, META, {
      value: {
        i: 'O' + ++id,
        // object ID
        w: {} // weak collections IDs

      }
    });
  };

  var fastKey = function fastKey(it, create) {
    // return primitive with prefix
    if (!_isObject(it)) return _typeof(it) == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;

    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return 'F'; // not necessary to add metadata

      if (!create) return 'E'; // add missing metadata

      setMeta(it); // return object ID
    }

    return it[META].i;
  };

  var getWeak = function getWeak(it, create) {
    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return true; // not necessary to add metadata

      if (!create) return false; // add missing metadata

      setMeta(it); // return hash weak collections IDs
    }

    return it[META].w;
  }; // add metadata on freeze-family methods calling


  var onFreeze = function onFreeze(it) {
    if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
    return it;
  };

  var meta = module.exports = {
    KEY: META,
    NEED: false,
    fastKey: fastKey,
    getWeak: getWeak,
    onFreeze: onFreeze
  };
});

var _meta_1 = _meta.KEY;
var _meta_2 = _meta.NEED;
var _meta_3 = _meta.fastKey;
var _meta_4 = _meta.getWeak;
var _meta_5 = _meta.onFreeze;

var def = _objectDp.f;
var TAG = _wks('toStringTag');

var _setToStringTag = function _setToStringTag(it, tag, stat) {
  if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, {
    configurable: true,
    value: tag
  });
};

var f$1 = _wks;
var _wksExt = {
  f: f$1
};

var _library = false;

var defineProperty = _objectDp.f;

var _wksDefine = function _wksDefine(name) {
  var $Symbol = _core.Symbol || (_core.Symbol = _library ? {} : _global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, {
    value: _wksExt.f(name)
  });
};

// eslint-disable-next-line no-prototype-builtins

var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return _cof(it) == 'String' ? it.split('') : Object(it);
};

var _toIobject = function _toIobject(it) {
  return _iobject(_defined(it));
};

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;

var _toInteger = function _toInteger(it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

var min = Math.min;

var _toLength = function _toLength(it) {
  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;

var _toAbsoluteIndex = function _toAbsoluteIndex(index, length) {
  index = _toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

// true  -> Array#includes

var _arrayIncludes = function _arrayIncludes(IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = _toIobject($this);
    var length = _toLength(O.length);
    var index = _toAbsoluteIndex(fromIndex, length);
    var value; // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare

    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++]; // eslint-disable-next-line no-self-compare

      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
    } else for (; length > index; index++) {
      if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      }
    }
    return !IS_INCLUDES && -1;
  };
};

var shared$1 = _shared('keys');

var _sharedKey = function _sharedKey(key) {
  return shared$1[key] || (shared$1[key] = _uid(key));
};

var arrayIndexOf = _arrayIncludes(false);
var IE_PROTO = _sharedKey('IE_PROTO');

var _objectKeysInternal = function _objectKeysInternal(object, names) {
  var O = _toIobject(object);
  var i = 0;
  var result = [];
  var key;

  for (key in O) {
    if (key != IE_PROTO) _has(O, key) && result.push(key);
  } // Don't enum bug & hidden keys


  while (names.length > i) {
    if (_has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
  }

  return result;
};

// IE 8- don't enum bug keys
var _enumBugKeys = 'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'.split(',');

var _objectKeys = Object.keys || function keys(O) {
  return _objectKeysInternal(O, _enumBugKeys);
};

var f$2 = Object.getOwnPropertySymbols;
var _objectGops = {
  f: f$2
};

var f$3 = {}.propertyIsEnumerable;
var _objectPie = {
  f: f$3
};

var _enumKeys = function _enumKeys(it) {
  var result = _objectKeys(it);
  var getSymbols = _objectGops.f;

  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = _objectPie.f;
    var i = 0;
    var key;

    while (symbols.length > i) {
      if (isEnum.call(it, key = symbols[i++])) result.push(key);
    }
  }

  return result;
};

var _isArray = Array.isArray || function isArray(arg) {
  return _cof(arg) == 'Array';
};

var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  _anObject(O);
  var keys = _objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;

  while (length > i) {
    _objectDp.f(O, P = keys[i++], Properties[P]);
  }

  return O;
};

var document$1 = _global.document;

var _html = document$1 && document$1.documentElement;

var IE_PROTO$1 = _sharedKey('IE_PROTO');

var Empty = function Empty() {
  /* empty */
};

var PROTOTYPE$1 = 'prototype'; // Create object with fake `null` prototype: use iframe Object with cleared prototype

var _createDict = function createDict() {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _domCreate('iframe');
  var i = _enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  _html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);

  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  _createDict = iframeDocument.F;

  while (i--) {
    delete _createDict[PROTOTYPE$1][_enumBugKeys[i]];
  }

  return _createDict();
};

var _objectCreate = Object.create || function create(O, Properties) {
  var result;

  if (O !== null) {
    Empty[PROTOTYPE$1] = _anObject(O);
    result = new Empty();
    Empty[PROTOTYPE$1] = null; // add "__proto__" for Object.getPrototypeOf polyfill

    result[IE_PROTO$1] = O;
  } else result = _createDict();

  return Properties === undefined ? result : _objectDps(result, Properties);
};

var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

var f$4 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return _objectKeysInternal(O, hiddenKeys);
};

var _objectGopn = {
  f: f$4
};

var gOPN = _objectGopn.f;
var toString$1 = {}.toString;
var windowNames = (typeof window === "undefined" ? "undefined" : _typeof(window)) == 'object' && window && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function getWindowNames(it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

var f$5 = function getOwnPropertyNames(it) {
  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
};

var _objectGopnExt = {
  f: f$5
};

var gOPD = Object.getOwnPropertyDescriptor;
var f$6 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = _toIobject(O);
  P = _toPrimitive(P, true);
  if (_ie8DomDefine) try {
    return gOPD(O, P);
  } catch (e) {
    /* empty */
  }
  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
};
var _objectGopd = {
  f: f$6
};

var META = _meta.KEY;
var gOPD$1 = _objectGopd.f;
var dP$2 = _objectDp.f;
var gOPN$1 = _objectGopnExt.f;
var $Symbol = _global.Symbol;
var $JSON = _global.JSON;

var _stringify = $JSON && $JSON.stringify;

var PROTOTYPE$2 = 'prototype';
var HIDDEN = _wks('_hidden');
var TO_PRIMITIVE = _wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = _shared('symbol-registry');
var AllSymbols = _shared('symbols');
var OPSymbols = _shared('op-symbols');
var ObjectProto = Object[PROTOTYPE$2];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = _global.QObject; // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173

var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild; // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687

var setSymbolDesc = _descriptors && _fails(function () {
  return _objectCreate(dP$2({}, 'a', {
    get: function get() {
      return dP$2(this, 'a', {
        value: 7
      }).a;
    }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD$1(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP$2(it, key, D);
  if (protoDesc && it !== ObjectProto) dP$2(ObjectProto, key, protoDesc);
} : dP$2;

var wrap = function wrap(tag) {
  var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);

  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && _typeof($Symbol.iterator) == 'symbol' ? function (it) {
  return _typeof(it) == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty$1 = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty$1(OPSymbols, key, D);
  _anObject(it);
  key = _toPrimitive(key, true);
  _anObject(D);

  if (_has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!_has(it, HIDDEN)) dP$2(it, HIDDEN, _propertyDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _objectCreate(D, {
        enumerable: _propertyDesc(0, false)
      });
    }

    return setSymbolDesc(it, key, D);
  }

  return dP$2(it, key, D);
};

var $defineProperties = function defineProperties(it, P) {
  _anObject(it);
  var keys = _enumKeys(P = _toIobject(P));
  var i = 0;
  var l = keys.length;
  var key;

  while (l > i) {
    $defineProperty$1(it, key = keys[i++], P[key]);
  }

  return it;
};

var $create = function create$$1(it, P) {
  return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
};

var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = _toPrimitive(key, true));
  if (this === ObjectProto && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
  return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = _toIobject(it);
  key = _toPrimitive(key, true);
  if (it === ObjectProto && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
  var D = gOPD$1(it, key);
  if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};

var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN$1(_toIobject(it));
  var result = [];
  var i = 0;
  var key;

  while (names.length > i) {
    if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  }

  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN$1(IS_OP ? OPSymbols : _toIobject(it));
  var result = [];
  var i = 0;
  var key;

  while (names.length > i) {
    if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  }

  return result;
}; // 19.4.1.1 Symbol([description])


if (!USE_NATIVE) {
  $Symbol = function _Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);

    var $set = function $set(value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, _propertyDesc(1, value));
    };

    if (_descriptors && setter) setSymbolDesc(ObjectProto, tag, {
      configurable: true,
      set: $set
    });
    return wrap(tag);
  };

  _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
    return this._k;
  });
  _objectGopd.f = $getOwnPropertyDescriptor;
  _objectDp.f = $defineProperty$1;
  _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
  _objectPie.f = $propertyIsEnumerable;
  _objectGops.f = $getOwnPropertySymbols;

  if (_descriptors && !_library) {
    _redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  _wksExt.f = function (name) {
    return wrap(_wks(name));
  };
}

_export(_export.G + _export.W + _export.F * !USE_NATIVE, {
  Symbol: $Symbol
});

for (var es6Symbols = // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'.split(','), j = 0; es6Symbols.length > j;) {
  _wks(es6Symbols[j++]);
}

for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) {
  _wksDefine(wellKnownSymbols[k++]);
}

_export(_export.S + _export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function _for(key) {
    return _has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
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
_export(_export.S + _export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty$1,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
}); // 24.3.2 JSON.stringify(value [, replacer [, space]])

$JSON && _export(_export.S + _export.F * (!USE_NATIVE || _fails(function () {
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
    if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined

    if (!_isArray(replacer)) replacer = function replacer(key, value) {
      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
}); // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)

$Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf); // 19.4.3.5 Symbol.prototype[@@toStringTag]

_setToStringTag($Symbol, 'Symbol'); // 20.2.1.9 Math[@@toStringTag]

_setToStringTag(Math, 'Math', true); // 24.3.3 JSON[@@toStringTag]

_setToStringTag(_global.JSON, 'JSON', true);

var UNSCOPABLES = _wks('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) _hide(ArrayProto, UNSCOPABLES, {});

var _addToUnscopables = function _addToUnscopables(key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

var _iterStep = function _iterStep(done, value) {
  return {
    value: value,
    done: !!done
  };
};

var _iterators = {};

var IteratorPrototype = {}; // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()

_hide(IteratorPrototype, _wks('iterator'), function () {
  return this;
});

var _iterCreate = function _iterCreate(Constructor, NAME, next) {
  Constructor.prototype = _objectCreate(IteratorPrototype, {
    next: _propertyDesc(1, next)
  });
  _setToStringTag(Constructor, NAME + ' Iterator');
};

var _toObject = function _toObject(it) {
  return Object(_defined(it));
};

var IE_PROTO$2 = _sharedKey('IE_PROTO');
var ObjectProto$1 = Object.prototype;

var _objectGpo = Object.getPrototypeOf || function (O) {
  O = _toObject(O);
  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];

  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  }

  return O instanceof Object ? ObjectProto$1 : null;
};

var ITERATOR = _wks('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`

var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function returnThis() {
  return this;
};

var _iterDefine = function _iterDefine(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  _iterCreate(Constructor, NAME, next);

  var getMethod = function getMethod(kind) {
    if (!BUGGY && kind in proto) return proto[kind];

    switch (kind) {
      case KEYS:
        return function keys() {
          return new Constructor(this, kind);
        };

      case VALUES:
        return function values() {
          return new Constructor(this, kind);
        };
    }

    return function entries() {
      return new Constructor(this, kind);
    };
  };

  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = !BUGGY && $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype; // Fix native

  if ($anyNative) {
    IteratorPrototype = _objectGpo($anyNative.call(new Base()));

    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      _setToStringTag(IteratorPrototype, TAG, true); // fix for some old engines

      if (!_library && !_has(IteratorPrototype, ITERATOR)) _hide(IteratorPrototype, ITERATOR, returnThis);
    }
  } // fix Array#{values, @@iterator}.name in V8 / FF


  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;

    $default = function values() {
      return $native.call(this);
    };
  } // Define iterator


  if ((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    _hide(proto, ITERATOR, $default);
  } // Plug for library


  _iterators[NAME] = $default;
  _iterators[TAG] = returnThis;

  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) _redefine(proto, key, methods[key]);
    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }

  return methods;
};

// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()


var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
  this._t = _toIobject(iterated); // target

  this._i = 0; // next index

  this._k = kind; // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;

  if (!O || index >= O.length) {
    this._t = undefined;
    return _iterStep(1);
  }

  if (kind == 'keys') return _iterStep(0, index);
  if (kind == 'values') return _iterStep(0, O[index]);
  return _iterStep(0, [index, O[index]]);
}, 'values'); // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)

_iterators.Arguments = _iterators.Array;
_addToUnscopables('keys');
_addToUnscopables('values');
_addToUnscopables('entries');

var ITERATOR$1 = _wks('iterator');
var TO_STRING_TAG = _wks('toStringTag');
var ArrayValues = _iterators.Array;
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

for (var collections = _objectKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME$1 = collections[i];
  var explicit = DOMIterables[NAME$1];
  var Collection = _global[NAME$1];
  var proto = Collection && Collection.prototype;
  var key;

  if (proto) {
    if (!proto[ITERATOR$1]) _hide(proto, ITERATOR$1, ArrayValues);
    if (!proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME$1);
    _iterators[NAME$1] = ArrayValues;
    if (explicit) for (key in es6_array_iterator) {
      if (!proto[key]) _redefine(proto, key, es6_array_iterator[key], true);
    }
  }
}

/* eslint-disable no-proto */

var check = function check(O, proto) {
  _anObject(O);
  if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};

var _setProto = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
  function (test, buggy, set) {
    try {
      set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
      set(test, []);
      buggy = !(test instanceof Array);
    } catch (e) {
      buggy = true;
    }

    return function setPrototypeOf(O, proto) {
      check(O, proto);
      if (buggy) O.__proto__ = proto;else set(O, proto);
      return O;
    };
  }({}, false) : undefined),
  check: check
};

_export(_export.S, 'Object', {
  setPrototypeOf: _setProto.set
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

var _redefineAll = function _redefineAll(target, src, safe) {
  for (var key in src) {
    _redefine(target, key, src[key], safe);
  }

  return target;
};

var _anInstance = function _anInstance(it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || forbiddenField !== undefined && forbiddenField in it) {
    throw TypeError(name + ': incorrect invocation!');
  }

  return it;
};

var _iterCall = function _iterCall(iterator, fn, value, entries) {
  try {
    return entries ? fn(_anObject(value)[0], value[1]) : fn(value); // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) _anObject(ret.call(iterator));
    throw e;
  }
};

var ITERATOR$2 = _wks('iterator');
var ArrayProto$1 = Array.prototype;

var _isArrayIter = function _isArrayIter(it) {
  return it !== undefined && (_iterators.Array === it || ArrayProto$1[ITERATOR$2] === it);
};

var TAG$1 = _wks('toStringTag'); // ES3 wrong here

var ARG = _cof(function () {
  return arguments;
}()) == 'Arguments'; // fallback for IE11 Script Access Denied error

var tryGet = function tryGet(it, key) {
  try {
    return it[key];
  } catch (e) {
    /* empty */
  }
};

var _classof = function _classof(it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null' // @@toStringTag case
  : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T // builtinTag case
  : ARG ? _cof(O) // ES3 arguments fallback
  : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

var ITERATOR$3 = _wks('iterator');

var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$3] || it['@@iterator'] || _iterators[_classof(it)];
};

var _forOf = createCommonjsModule(function (module) {
  var BREAK = {};
  var RETURN = {};

  var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
    var iterFn = ITERATOR ? function () {
      return iterable;
    } : core_getIteratorMethod(iterable);
    var f = _ctx(fn, that, entries ? 2 : 1);
    var index = 0;
    var length, step, iterator, result;
    if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!'); // fast case for arrays with default iterator

    if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
      result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
      if (result === BREAK || result === RETURN) return result;
    } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
      result = _iterCall(iterator, f, step.value, entries);
      if (result === BREAK || result === RETURN) return result;
    }
  };

  exports.BREAK = BREAK;
  exports.RETURN = RETURN;
});

var SPECIES = _wks('species');

var _setSpecies = function _setSpecies(KEY) {
  var C = _global[KEY];
  if (_descriptors && C && !C[SPECIES]) _objectDp.f(C, SPECIES, {
    configurable: true,
    get: function get() {
      return this;
    }
  });
};

var _validateCollection = function _validateCollection(it, TYPE) {
  if (!_isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

var dP$3 = _objectDp.f;
var fastKey = _meta.fastKey;
var SIZE = _descriptors ? '_s' : 'size';

var getEntry = function getEntry(that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index]; // frozen object case

  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

var _collectionStrong = {
  getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      _anInstance(that, C, NAME, '_i');
      that._t = NAME; // collection type

      that._i = _objectCreate(null); // index

      that._f = undefined; // first entry

      that._l = undefined; // last entry

      that[SIZE] = 0; // size

      if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
    });
    _redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = _validateCollection(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }

        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function _delete(key) {
        var that = _validateCollection(this, NAME);
        var entry = getEntry(that, key);

        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        }

        return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn
      /* , that = undefined */
      ) {
        _validateCollection(this, NAME);
        var f = _ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;

        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this); // revert to the last existing entry

          while (entry && entry.r) {
            entry = entry.p;
          }
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(_validateCollection(this, NAME), key);
      }
    });
    if (_descriptors) dP$3(C.prototype, 'size', {
      get: function get() {
        return _validateCollection(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function def(that, key, value) {
    var entry = getEntry(that, key);
    var prev, index; // change existing entry

    if (entry) {
      entry.v = value; // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true),
        // <- index
        k: key,
        // <- key
        v: value,
        // <- value
        p: prev = that._l,
        // <- previous entry
        n: undefined,
        // <- next entry
        r: false // <- removed

      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++; // add to index

      if (index !== 'F') that._i[index] = entry;
    }

    return that;
  },
  getEntry: getEntry,
  setStrong: function setStrong(C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    _iterDefine(C, NAME, function (iterated, kind) {
      this._t = _validateCollection(iterated, NAME); // target

      this._k = kind; // kind

      this._l = undefined; // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l; // revert to the last existing entry

      while (entry && entry.r) {
        entry = entry.p;
      } // get next entry


      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return _iterStep(1);
      } // return step by kind


      if (kind == 'keys') return _iterStep(0, entry.k);
      if (kind == 'values') return _iterStep(0, entry.v);
      return _iterStep(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true); // add [@@species], 23.1.2.2, 23.2.2.2

    _setSpecies(NAME);
  }
};

var _createProperty = function _createProperty(object, index, value) {
  if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));else object[index] = value;
};

_export(_export.S + _export.F * !_iterDetect(function (iter) {
  
}), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike
  /* , mapfn = undefined, thisArg = undefined */
  ) {
    var O = _toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = core_getIteratorMethod(O);
    var length, result, step, iterator;
    if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2); // if object isn't iterable or it's array with default iterator - use simple case

    if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = _toLength(O.length);

      for (result = new C(length); length > index; index++) {
        _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }

    result.length = index;
    return result;
  }
});

var ITERATOR$4 = _wks('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR$4]();

  riter['return'] = function () {
    SAFE_CLOSING = true;
  }; // eslint-disable-next-line no-throw-literal


  
} catch (e) {
  /* empty */
}

var _iterDetect = function _iterDetect(exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;

  try {
    var arr = [7];
    var iter = arr[ITERATOR$4]();

    iter.next = function () {
      return {
        done: safe = true
      };
    };

    arr[ITERATOR$4] = function () {
      return iter;
    };

    exec(arr);
  } catch (e) {
    /* empty */
  }

  return safe;
};

var setPrototypeOf = _setProto.set;

var _inheritIfRequired = function _inheritIfRequired(that, target, C) {
  var S = target.constructor;
  var P;

  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  }

  return that;
};

var _collection = function _collection(NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = _global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};

  var fixMethod = function fixMethod(KEY) {
    var fn = proto[KEY];
    _redefine(proto, KEY, KEY == 'delete' ? function (a) {
      return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'has' ? function has(a) {
      return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'get' ? function get(a) {
      return IS_WEAK && !_isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
    } : KEY == 'add' ? function add(a) {
      fn.call(this, a === 0 ? 0 : a);
      return this;
    } : function set(a, b) {
      fn.call(this, a === 0 ? 0 : a, b);
      return this;
    });
  };

  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !_fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    _redefineAll(C.prototype, methods);
    _meta.NEED = true;
  } else {
    var instance = new C(); // early implementations not supports chaining

    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance; // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false

    var THROWS_ON_PRIMITIVES = _fails(function () {
      instance.has(1);
    }); // most early implementations doesn't supports iterables, most modern - not close it correctly

    var ACCEPT_ITERABLES = _iterDetect(function (iter) {
      new C(iter);
    }); // eslint-disable-line no-new
    // for early implementations -0 and +0 not the same

    var BUGGY_ZERO = !IS_WEAK && _fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new C();
      var index = 5;

      while (index--) {
        $instance[ADDER](index, index);
      }

      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      C = wrapper(function (target, iterable) {
        _anInstance(target, C, NAME);
        var that = _inheritIfRequired(new Base(), target, C);
        if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }

    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }

    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER); // weak collections should not contains .clear method

    if (IS_WEAK && proto.clear) delete proto.clear;
  }

  _setToStringTag(C, NAME);
  O[NAME] = C;
  _export(_export.G + _export.W + _export.F * (C != Base), O);
  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);
  return C;
};

var SET = 'Set'; // 23.2 Set Objects

var es6_set = _collection(SET, function (get) {
  return function Set() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return _collectionStrong.def(_validateCollection(this, SET), value = value === 0 ? 0 : value, value);
  }
}, _collectionStrong);

var MAP = 'Map'; // 23.1 Map Objects

var es6_map = _collection(MAP, function (get) {
  return function Map() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = _collectionStrong.getEntry(_validateCollection(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return _collectionStrong.def(_validateCollection(this, MAP), key === 0 ? 0 : key, value);
  }
}, _collectionStrong, true);

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

eventcenter.on('delete-observer', function (observer) {
  values.delete(observer);
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
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _item = _step.value;

      if (_item.setter === setter && _item.callback === callback) {
        exists = true;
        break;
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
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = setters[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _setter = _step2.value;
          ec.on(_setter, _cb2);
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

      var oldvalue = setValue(observer, fn, value);

      if (oldvalue !== value) {
        handler(value, oldvalue, observer);
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

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = _setters[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _setter2 = _step3.value;
            ec.on(_setter2, _cb2);
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
  setValue(observer, exp, value);
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
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = setters[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var _setter3 = _step4.value;
      ec.on(_setter3, _cb2);
      setHandler(observer, exp, handler, _setter3, _cb2);
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
}

function unwatch(observer, exp, handler) {
  var map = handlers.get(observer);
  if (!map) return;
  map = map.get(exp);
  if (!map) return;
  var list = map.get(handler);
  if (!list) return;
  var callback;
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = list[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var _item2 = _step5.value;
      callback = _item2.callback;
      ec.removeListener(_item2.setter, _item2.callback);
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

  callbacks.delete(callback);
}

/** 
 * @file to convert an object to an observer instance.
 */

var getKeys$1 = Object.keys;
var isArray$1 = Array.isArray;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var defineProperty$1 = Object.defineProperty;
var setPrototypeOf$1 = Object.setPrototypeOf;
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
  defineProperty$1(arrMethods, method, {
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

      ec.emit(this.__setter);
      return result;
    }
  });
  defineProperty$1(arrMethods, '$set', {
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

    if (v === value) return; //console.log( `[Observer setter]: ${path}` );

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

  defineProperty$1(obj, key, {
    enumerable: descriptor ? descriptor.enumerable : true,
    configurable: true,
    set: set,
    get: get
  });

  if (isArray$1(val)) {
    defineProperty$1(val, '__setter', {
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
    setPrototypeOf$1(obj, arrMethods);

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
    traverse(obj, obj);

    if (proto) {
      setPrototypeOf$1(obj, proto);
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
  watch: function watch$$1(observer, exp, handler) {
    watch(observer, exp, handler);
  },
  unwatch: function unwatch$$1(observer, exp, handler) {
    unwatch(observer, exp, handler);
  }
};

return Observer;

})));
