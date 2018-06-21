(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Observer = factory());
}(this, (function () { 'use strict';

function isNumber ( n, strict ) {
    if ( strict === void 0 ) strict = false;

    if( ({}).toString.call( n ).toLowerCase() === '[object number]' ) {
        return true;
    }
    if( strict ) { return false; }
    return !isNaN( parseFloat( n ) ) && isFinite( n )  && !/\.$/.test( n );
}

function isString (str) { return typeof str === 'string' || str instanceof String; }

function isInteger ( n, strict ) {
    if ( strict === void 0 ) strict = false;


    if( isNumber( n, true ) ) { return n % 1 === 0; }

    if( strict ) { return false; }

    if( isString( n ) ) {
        if( n === '-0' ) { return true; }
        return n.indexOf( '.' ) < 0 && String( parseInt( n ) ) === n;
    }

    return false;
}

function isAsyncFunction (fn) { return ( {} ).toString.call( fn ) === '[object AsyncFunction]'; }

function isFunction (fn) { return ({}).toString.call( fn ) === '[object Function]' || isAsyncFunction( fn ); }

function isRegExp (reg) { return ({}).toString.call( reg ) === '[object RegExp]'; }

var EventEmitter = function EventEmitter() {
    this.__listeners = new Map();
};

EventEmitter.prototype.alias = function alias ( name, to ) {
    this[ name ] = this[ to ].bind( this );
};

EventEmitter.prototype.on = function on ( evt, handler ) {
    var listeners = this.__listeners;
    var handlers = listeners.get( evt );

    if( !handlers ) {
        handlers = new Set();
        listeners.set( evt, handlers );
    }
    handlers.add( handler );
    return this;
};

EventEmitter.prototype.once = function once ( evt, handler ) {
        var this$1 = this;

    var _handler = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

        handler.apply( this$1, args );
        this$1.removeListener( evt, _handler );
    };
    return this.on( evt, _handler );
};

EventEmitter.prototype.removeListener = function removeListener ( evt, handler ) {
    var listeners = this.__listeners;
    var handlers = listeners.get( evt );
    handlers && handlers.delete( handler );
    return this;
};

EventEmitter.prototype.emit = function emit ( evt ) {
        var this$1 = this;
        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    var handlers = this.__listeners.get( evt );
    if( !handlers ) { return false; }
    handlers.forEach( function (handler) { return handler.call.apply( handler, [ this$1 ].concat( args ) ); } );
};

EventEmitter.prototype.removeAllListeners = function removeAllListeners ( rule ) {
    var checker;
    if( isString( rule ) ) {
        checker = function (name) { return rule === name; };
    } else if( isFunction( rule ) ) {
        checker = rule;
    } else if( isRegExp( rule ) ) {
        checker = function (name) {
            rule.lastIndex = 0;
            return rule.test( name );
        };
    }

    var listeners = this.__listeners;

    listeners.forEach( function ( value, key ) {
        checker( key ) && listeners.delete( key );
    } );
    return this;
};

function isPromise (p) { return p && isFunction( p.then ); }

function isUndefined() {
    return arguments.length > 0 && typeof arguments[ 0 ] === 'undefined';
}

var eventcenter = new EventEmitter();

var collector = {
    records : [],
    collecting : false,
    start: function start() {
        this.records = [];
        this.collecting = true;
    },
    stop: function stop() {
        this.collecting = false;
        return this.records;
    },
    add: function add( data ) {
        this.collecting && this.records.push( data );
    }
};

function isSubset( obj, container ) {
    if( !obj || typeof obj !== 'object' ) { return false; }
    for( var prop in container ) {
        var item = container[ prop ];
        if( item === obj ) { return true; }

        if( item && typeof item === 'object' ) {
            var res = isSubset( obj, item );
            if( res ) { return true; }
        }
    }

    return false;
}

/**
 * soe map, for storing relations between setters, observers and expressions.
 * Map( {
 *     setter : Map( {
 *          observer : Map( {
 *              exp : Set( [ ...handlers ] )
 *          } )
 *     } )
 * } )
 */
var soe = new Map();

function set( setter, observer, exp, handler ) {
    var map = soe.get( setter ); 
    if( !map ) {
        return soe.set( setter, new Map( [ 
            [ observer, new Map( [ 
                [ exp, new Set( [ handler ] ) ]
            ] ) ]
        ] ) );
    }
    var obs = map.get( observer );
    if( !obs ) {
        return map.set( observer, new Map( [ 
            [ exp, new Set( [ handler ] ) ]
        ] ) );
    }
    var exps = obs.get( exp );
    exps ? exps.add( handler ) : obs.set( exp, new Set( [ handler ] ) );
}

function getSetter( setter ) {
    return soe.get( setter );
}

function forEachAllObserver( cb ) {
    soe.forEach( function (obs) {
        obs.forEach( function ( exps, ob ) {
            exps.forEach( function ( handlers, exp ) { return cb( ob, exp, handlers ); } );
        } );
    } );
}

function forEachExps( setter, cb ) {
    var map = soe.get( setter );
    if( !map ) { return; }
    map.forEach( function ( exps, ob ) {
        exps.forEach( function ( handlers, exp ) { return cb( ob, exp, handlers ); } );
    } );
}

function deleteSetter( setter ) {
    soe.delete( setter );
}

function deleteObserver( observer ) {
    soe.forEach( function (obs) { return obs.delete( observer ); } );
}

function deleteSetterObserver( setter, observer ) {
    try {
        return soe.get( setter ).delete( observer );
    } catch( e ) {
        return false;
    }
}

function deleteHandler( observer, expression, handler ) {
    soe.forEach( function (obs) {
        obs.forEach( function ( exps, ob ) {
            if( ob !== observer ) { return; }
            exps.forEach( function ( handlers, exp ) {
                if( exp !== expression ) { return; }
                handlers.delete( handler );
            } );
        } );
    } );
}

var soe$1 = { 
    set: set, getSetter: getSetter, forEachExps: forEachExps, forEachAllObserver: forEachAllObserver, 
    deleteSetter: deleteSetter, deleteObserver: deleteObserver, deleteSetterObserver: deleteSetterObserver, deleteHandler: deleteHandler
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
 * To do some preparations while adding a new observer.
 */
eventcenter.on( 'add-observer', function (observer) {
    if( !values.get( observer ) ) {
        values.set( observer, new Map() );
    }
} );

/**
 * Processes after deleting an observer.
 */
eventcenter.on( 'destroy-observer',  function (observer) {
    soe$1.deleteObserver( observer );
} );

/**
 * while setting new data into an object in an observer, or deleting properties of objects in observers,
 * all callback function should be executed again to check if the changes would effect any expressions.
 */
eventcenter.on( 'set-value', function () {
    // to execute all expressions after deleting a property from an observer.
    soe$1.forEachAllObserver( execute );
} );

/**
 * to remove useless listeners for release memory.
 */
var gc = function ( obj ) {
    if( !obj || typeof obj !== 'object' ) { return; }
    var keys = Object.keys;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    soe$1.forEachAllObserver( function (observer) {
        if( isSubset( obj, observer ) ) { return; }
        for( var i = 0, list = keys( obj ); i < list.length; i += 1 ) {
            var key = list[i];

            var descriptor = getOwnPropertyDescriptor( obj, key ); 
            var setter = descriptor && descriptor.set;
            if( !setter ) { continue; }
            soe$1.deleteSetterObserver( setter, observer );
            var item = obj[ key ];
            item && typeof item === 'object' && gc( item );
        }
    } );
};

eventcenter.on( 'overwrite-object', function ( val, old ) { return gc( old ); } );

eventcenter.on( 'delete-property', function ( deleted, setter ) {
    // to execute all expressions after deleting a property from an observer.
    soe$1.forEachAllObserver( execute );
    soe$1.deleteSetter( setter );
    gc( deleted );
} );

/**
 * @function expression
 * To convert the expression to a function.
 *
 * @param {Function|String} exp
 */
function expression( exp ) {
    if( isFunction( exp ) ) { return exp; }
    var fn = caches.get( exp );
    if( fn ) { return fn; }
    fn = new Function( 's', 'try{with(s)return ' + exp + '}catch(e){return null}' );
    caches.set( exp, fn );
    return fn;
}

/**
 * @function setValue
 * To store a new value for an expression of an observer and to return the old value
 *
 * @param {Observer} observer
 * @param {Function|String} exp
 * @param {*} value
 */
function setValue( observer, exp, value ) {
    var oldvalue;
    var map = values.get( observer );
    oldvalue = map.get( exp );

    if( value !== oldvalue ) {
        map.set( exp, value );
    }
    return oldvalue;
}

function getValue( observer, exp ) {
    return values.get( observer ).get( exp );
}

function execute( observer, exp, handlers ) {
    var fn = expression( exp );
    collector.start();
    var val = fn( observer );
    var setters = collector.stop();
    for( var i$1 = 0, list$1 = setters; i$1 < list$1.length; i$1 += 1 ) {
        var setter = list$1[i$1];

        for( var i = 0, list = handlers; i < list.length; i += 1 ) {
            var handler = list[i];

            listen( setter, observer, exp, handler );
        }
    }
    if( isPromise( val ) ) {
        val.then( function (n) {
            var ov = getValue( observer, exp );
            if( ov !== n ) {
                handlers.forEach( function (handler) { return handler( n, ov, observer, exp ); } );
                setValue( observer, exp, n );
            }
        } );
    } else {
        var ov = getValue( observer, exp );
        if( ov !== val ) {
            handlers.forEach( function (handler) { return handler( val, ov, observer, exp ); } );
        setValue( observer, exp, val );
        }
    }
}

function listen( setter, observer, exp, handler ) {
    if( !soe$1.getSetter( setter ) ) {
        /**
         * to bind event on the setter
         */
        ec.on( setter, function () { return soe$1.forEachExps( setter, execute ); } );
    }
    soe$1.set( setter, observer, exp, handler );
}

/**
 * @function watch
 * To watch changes of an expression or a function of an observer.
 */
function watch( observer, exp, handler ) {
    var fn = expression( exp );

    collector.start();
    var value = fn( observer );
    var setters = collector.stop();
    if( setters.length ) {
        for( var i = 0, list = setters; i < list.length; i += 1 ) {
            var setter = list[i];

            listen( setter, observer, exp, handler );
        }
    } else {
        /**
         * to set a listener with a NULL setter
         */
        listen( null, observer, exp, handler );
    }

    if( isPromise( value ) ) {
        value.then( function (val) { return setValue( observer, exp, val ); } );
    } else {
        setValue( observer, exp, value );
    }
}

function unwatch( observer, exp, handler ) {
    soe$1.deleteHandler( observer, exp, handler );
}

function calc( observer, exp, defaultValue ) {
    var val = expression( exp )( observer );
    if( !isUndefined( defaultValue ) && ( val === null || isUndefined( val ) ) ) { return defaultValue; }
    return val;
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
var arrMethods = Object.create( proto);



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

var arrayTraverseTranslate = true;

[ 'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill' ].forEach( function (method) {

    var original = proto[ method ];

    defineProperty( arrMethods, method, {
        enumerable : false,
        writable : true,
        configurable : true,
        value: function value() {
            var i$2 = arguments.length, argsArray = Array(i$2);
            while ( i$2-- ) argsArray[i$2] = arguments[i$2];

            var args = [].concat( argsArray );
            var result = original.apply( this, args );
            var inserted, deleted;

            switch( method ) {
                case 'push' :
                case 'unshift' :
                    inserted = args;
                    break;
                case 'splice' :
                    inserted = args.slice( 2 );
                    deleted = result;
                    break;
                case 'fill' :
                    inserted = args[ 0 ];
                    break;
                case 'pop' :
                case 'shift' :
                    deleted = [ result ];
                    break;
            }

            if( deleted ) {
                for( var i = 0, list = deleted; i < list.length; i += 1 ) {
                    var item = list[i];

                    if( item && typeof item === 'object' ) {
                        eventcenter.emit( 'delete-property', item );
                    }
                }
            }

            if( inserted ) {
                for( var i$1 = 0, list$1 = inserted; i$1 < list$1.length; i$1 += 1 ) {
                    var item$1 = list$1[i$1];

                    if( item$1 && typeof item$1 === 'object' ) {
                        arrayTraverseTranslate && traverse( item$1 );
                    }
                }
            }
            this.__fake_setter ? ec.emit( this.__fake_setter ) : ec.emit( this.__setter );
            return result;
        }
    } );

    defineProperty( arrMethods, '$set', {
        enumerable : false,
        writable : true,
        configurable : true,
        value: function value( i, v, trans ) {
            if( i >= this.length ) {
                this.length = +i + 1;
            }
            arrayTraverseTranslate = trans;
            var res = this.splice( i, 1, v )[ 0 ];
            arrayTraverseTranslate = true;
            return res;
        }
    } );

    defineProperty( arrMethods, '$get', {
        enumerable : false,
        writable : true,
        configurable : true,
        value: function value( i ) {
            var setter = this.__fake_setter;
            setter && collector.add( setter );
            return this[ i ];
        }
    } );

    defineProperty( arrMethods, '$length', {
        enumerable : false,
        writable : true,
        configurable : true,
        value: function value( i ) {
            this.length = i;
            this.__fake_setter ? ec.emit( this.__fake_setter ) : ec.emit( this.__setter );
        }
    } );
} );

function isObserverSetter( func ) {
    return func.name === 'OBSERVER_SETTER' || /^function\s+OBSERVER_SETTER\(\)/.test( func.toString() );
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
function translate( obj, key, val ) {
    var descriptor = getOwnPropertyDescriptor( obj, key );
    /**
     * if the configurable of the property is false,
     * the property cannot be translated
     */
    if( descriptor && !descriptor.configurable ) { return; }

    var setter = descriptor && descriptor.set;

    /**
     * The property has already transformed by Observer.
     * to add the observer and path into the map.
     */
    if( setter && isObserverSetter( setter ) ) {
        /**
         * while translating a property of an object multiple times with different values,
         * The same setter should be used but to set the value to the new value.
         */
        return obj[ key ] = val;
    }

    var getter = descriptor && descriptor.get;

    var set = function OBSERVER_SETTER( v ) {
        var value = getter ? getter.call( obj ) : val;
        /**
         * Setting the same value will not call the setter.
         */
        if( v === value ) { return; }

        if( setter ) {
            setter.call( obj, v );
        } else {
            val = v;

            /**
             * if the new value is an object, to set the new value with Observer.set method.
             * it should be set to all observers which are using this object.
             */
            if( v && typeof v === 'object' ) {
                traverse( v );
            }

            if( value && typeof value === 'object' ) {
                eventcenter.emit( 'overwrite-object', v, value );
            }
        }
        ec.emit( set );
    };

    var get = function OBSERVER_GETTER() {
        collector.add( set );   
        return getter ? getter.call( obj ) : val;
    };

    defineProperty( obj, key, {
        enumerable : descriptor ? descriptor.enumerable : true,
        configurable : true,
        set: set,
        get: get
    } );

    if( isArray( val ) ) {
        defineProperty( val, '__setter', {
            enumerable : false,
            writable : true,
            configurable : true,
            value : set
        } );
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
function traverse( obj ) {

    var isarr = isArray( obj );

    if( isarr ) {
        setPrototypeOf( obj, arrMethods );
        for( var i = 0, l = obj.length; i < l; i += 1 ) {
            var item = obj[ i ];

            if( item && typeof item === 'object' ) {
                traverse( item );
            }
        }
    }

    var keys = getKeys( obj );

    for( var i$1 = 0, list = keys; i$1 < list.length; i$1 += 1 ) {
        var key = list[i$1];

        var val = obj[ key ];
        // to skip translating the indexes of array
        if( isarr && isInteger( key ) && key >= 0 && key < obj.length ) { continue; }

        translate( obj, key, val );

        if( val && typeof val === 'object' ) {
            traverse( val );
        }
    }
}

var Observer = {
    create: function create( obj, proto ) {
        if( obj.__observer ) { return obj; }

        defineProperty( obj, '__observer', {
            enumerable : false,
            writable : true,
            configurable : true,
            value : true
        } );

        if( isArray( obj ) ) {
            defineProperty( obj, '__fake_setter', {
                enumerable : false,
                writable : true,
                configurable : true,
                value : function OBSERVER_SETTER() {}
            } );
        }

        traverse( obj );
        proto && setPrototypeOf( obj, proto );
        eventcenter.emit( 'add-observer', obj );         
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
    set: function set( obj, key, value, trans ) {
        if ( trans === void 0 ) trans = true;


        /**
         * if the object is an array and the key is a integer, set the value with [].$set
         */
        if( isArray( obj ) && isInteger( key, true ) ) {
            return obj.$set( key, value, trans );
        }

        var old = obj[ key ];

        if( old && typeof old === 'object' ) {
            ec.emit( 'overwrite-object', value, old );
        }

        var isobj = value && typeof value === 'object';

        /**
         * to add the property to the specified object and to translate it to the format of observer.
         */
        translate( obj, key, value );
        /**
         * if the value is an object, to traverse the object with all paths in all observers
         */
        isobj && trans && traverse( value );
        eventcenter.emit( 'set-value', obj, key, value, old );
    },

    /**
     * @function delete
     * To delete an property from
     *
     * - delete all relevant data, storing in each map, for both the specified property and its sub/descandant object.
     * -
     */
    delete: function delete$1( obj, key ) {
        var old = obj[ key ];
        var descriptor = Object.getOwnPropertyDescriptor( obj, key );
        var setter = descriptor && descriptor.set;
        delete obj[ key ];
        eventcenter.emit( 'delete-property', old, setter );
    },

    /**
     * @function translated 
     * to check if the property in the object has been translated to observer setter and getter
     *
     * @param {Object|Array} obj
     * @param {String|Integer} key The property name
     *
     */
    translated: function translated( obj, key ) {
        var descriptor = Object.getOwnPropertyDescriptor( obj, key );
        if( descriptor && !descriptor.configurable ) {
            return false;
        }
        var setter = descriptor && descriptor.set;
        return !!( setter && isObserverSetter( setter ) );
    },

    is: function is( observer ) {
        return observer.__observer || false;
    },

    watch: function watch$1( observer, exp, handler ) {
        watch( observer, exp, handler );
    },

    unwatch: function unwatch$1( observer, exp, handler ) {
        unwatch( observer, exp, handler );
    },

    calc: function calc$1( observer, exp, defaultValue ) {
        return calc( observer, exp, defaultValue );
    },

    replace: function replace( observer, data ) {
        for( var i = 0, list = Object.keys( observer ); i < list.length; i += 1 ) {
            var key = list[i];

            if( !data.hasOwnProperty( key ) ) {
                Observer.delete( observer, key );
            }
        }

        for( var i$1 = 0, list$1 = Object.keys( data ); i$1 < list$1.length; i$1 += 1 ) {
            var key$1 = list$1[i$1];

            if( observer.hasOwnProperty( key$1 ) ) {
                observer[ key$1 ] = data[ key$1 ];
            } else {
                Observer.set( observer, key$1, data[ key$1 ] );
            }
        }
        return observer;
    },

    destroy: function destroy( observer ) {
        eventcenter.emit( 'destroy-observer', observer );
    }
};

return Observer;

})));
