'use strict';

var isNumber = ( n, strict = false ) => {
    if( ({}).toString.call( n ).toLowerCase() === '[object number]' ) {
        return true;
    }
    if( strict ) return false;
    return !isNaN( parseFloat( n ) ) && isFinite( n )  && !/\.$/.test( n );
};

var isString = str => typeof str === 'string' || str instanceof String;

var isInteger = ( n, strict = false ) => {

    if( isNumber( n, true ) ) return n % 1 === 0;

    if( strict ) return false;

    if( isString( n ) ) {
        if( n === '-0' ) return true;
        return n.indexOf( '.' ) < 0 && String( parseInt( n ) ) === n;
    }

    return false;
}

var isAsyncFunction = fn => ( {} ).toString.call( fn ) === '[object AsyncFunction]';

var isFunction = fn => ({}).toString.call( fn ) === '[object Function]' || isAsyncFunction( fn );

var isRegExp = reg => ({}).toString.call( reg ) === '[object RegExp]';

class EventEmitter {
    constructor() {
        this.__listeners = new Map();
    }

    alias( name, to ) {
        this[ name ] = this[ to ].bind( this );
    }

    on( evt, handler ) {
        const listeners = this.__listeners;
        let handlers = listeners.get( evt );

        if( !handlers ) {
            handlers = new Set();
            listeners.set( evt, handlers );
        }
        handlers.add( handler );
        return this;
    }

    once( evt, handler ) {
        const _handler = ( ...args ) => {
            handler.apply( this, args );
            this.removeListener( evt, _handler );
        };
        return this.on( evt, _handler );
    }

    removeListener( evt, handler ) {
        const listeners = this.__listeners;
        const handlers = listeners.get( evt );
        handlers && handlers.delete( handler );
        return this;
    }

    emit( evt, ...args ) {
        const handlers = this.__listeners.get( evt );
        if( !handlers ) return false;
        handlers.forEach( handler => handler.call( this, ...args ) );
    }

    removeAllListeners( rule ) {
        let checker;
        if( isString( rule ) ) {
            checker = name => rule === name;
        } else if( isFunction( rule ) ) {
            checker = rule;
        } else if( isRegExp( rule ) ) {
            checker = name => {
                rule.lastIndex = 0;
                return rule.test( name );
            };
        }

        const listeners = this.__listeners;

        listeners.forEach( ( value, key ) => {
            checker( key ) && listeners.delete( key );
        } );
        return this;
    }
}

var isPromise = p => p && isFunction( p.then );

function isUndefined() {
    return arguments.length > 0 && typeof arguments[ 0 ] === 'undefined';
}

const eventcenter = new EventEmitter();

const collector = {
    records : [],
    collecting : false,
    start() {
        this.records = [];
        this.collecting = true;
    },
    stop() {
        this.collecting = false;
        return this.records;
    },
    add( data ) {
        this.collecting && this.records.push( data );
    }
};

function isSubset( obj, container ) {
    if( !obj || typeof obj !== 'object' ) return false;
    for( const prop in container ) {
        const item = container[ prop ];
        if( item === obj ) return true;

        if( item && typeof item === 'object' ) {
            const res = isSubset( obj, item );
            if( res ) return true;
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
const soe = new Map();

function set( setter, observer, exp, handler ) {
    const map = soe.get( setter ); 
    if( !map ) {
        return soe.set( setter, new Map( [ 
            [ observer, new Map( [ 
                [ exp, new Set( [ handler ] ) ]
            ] ) ]
        ] ) );
    }
    const obs = map.get( observer );
    if( !obs ) {
        return map.set( observer, new Map( [ 
            [ exp, new Set( [ handler ] ) ]
        ] ) );
    }
    const exps = obs.get( exp );
    exps ? exps.add( handler ) : obs.set( exp, new Set( [ handler ] ) );
}

function getSetter( setter ) {
    return soe.get( setter );
}

function forEachAllObserver( cb ) {
    soe.forEach( obs => {
        obs.forEach( ( exps, ob ) => {
            exps.forEach( ( handlers, exp ) => cb( ob, exp, handlers ) );
        } );
    } );
}

function forEachExps( setter, cb ) {
    const map = soe.get( setter );
    if( !map ) return;
    map.forEach( ( exps, ob ) => {
        exps.forEach( ( handlers, exp ) => cb( ob, exp, handlers ) );
    } );
}

function deleteSetter( setter ) {
    soe.delete( setter );
}

function deleteObserver( observer ) {
    soe.forEach( obs => obs.delete( observer ) );
}

function deleteSetterObserver( setter, observer ) {
    try {
        return soe.get( setter ).delete( observer );
    } catch( e ) {
        return false;
    }
}

function deleteHandler( observer, expression, handler ) {
    soe.forEach( obs => {
        obs.forEach( ( exps, ob ) => {
            if( ob !== observer ) return;
            exps.forEach( ( handlers, exp ) => {
                if( exp !== expression ) return;
                handlers.delete( handler );
            } );
        } );
    } );
}

var soe$1 = { 
    set, getSetter, forEachExps, forEachAllObserver, 
    deleteSetter, deleteObserver, deleteSetterObserver, deleteHandler
};

const ec = new EventEmitter();

/**
 * caches for storing expressions.
 * Map( {
 *      expression : fn
 * } )
 */
const caches = new Map();

/**
 * for storing the old values of each expression.
 * Map( {
 *      observer : Map( {
 *          expression/function : value
 *      } )
 * } )
 */
const values = new Map();

/**
 * To do some preparations while adding a new observer.
 */
eventcenter.on( 'add-observer', observer => {
    if( !values.get( observer ) ) {
        values.set( observer, new Map() );
    }
} );

/**
 * Processes after deleting an observer.
 */
eventcenter.on( 'destroy-observer',  observer => {
    soe$1.deleteObserver( observer );
    values.set( observer, new Map() );
} );

/**
 * while setting new data into an object in an observer, or deleting properties of objects in observers,
 * all callback function should be executed again to check if the changes would effect any expressions.
 */
eventcenter.on( 'set-value', ( obj, key, value, old, mute ) => {
    // to execute all expressions after deleting a property from an observer.
    mute || soe$1.forEachAllObserver( execute );
} );

/**
 * to remove useless listeners for release memory.
 */
const gc = ( obj ) => {
    if( !obj || typeof obj !== 'object' ) return;
    const keys = Object.keys;
    const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    soe$1.forEachAllObserver( observer => {
        if( isSubset( obj, observer ) ) return;
        for( let key of keys( obj ) ) {
            const descriptor = getOwnPropertyDescriptor( obj, key ); 
            const setter = descriptor && descriptor.set;
            if( !setter ) continue;
            soe$1.deleteSetterObserver( setter, observer );
            const item = obj[ key ];
            item && typeof item === 'object' && gc( item );
        }
    } );
};

eventcenter.on( 'overwrite-object', ( val, old ) => gc( old ) );

eventcenter.on( 'delete-property', ( deleted, setter ) => {
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
    if( isFunction( exp ) ) return exp;
    let fn = caches.get( exp );
    if( fn ) return fn;
    fn = new Function( 's', `try{with(s)return ${exp}}catch(e){return null}` );
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
    values.get( observer ).set( exp, value );
}

function getValue( observer, exp ) {
    return values.get( observer ).get( exp );
}

function execute( observer, exp, handlers ) {
    const fn = expression( exp );
    collector.start();
    const val = fn( observer );
    const setters = collector.stop();
    for( let setter of setters ) {
        for( let handler of handlers ) {
            listen( setter, observer, exp, handler );
        }
    }
    if( isPromise( val ) ) {
        val.then( n => {
            const ov = getValue( observer, exp );
            if( ov !== n ) {
                handlers.forEach( handler => handler( n, ov, observer, exp ) );
                setValue( observer, exp, n );
            }
        } );
    } else {
        const ov = getValue( observer, exp );
        if( ov !== val ) {
            handlers.forEach( handler => handler( val, ov, observer, exp ) );
            setValue( observer, exp, val );
        }
    }
}

function listen( setter, observer, exp, handler ) {
    if( !soe$1.getSetter( setter ) ) {
        /**
         * to bind event on the setter
         */
        ec.on( setter, () => soe$1.forEachExps( setter, execute ) );
    }
    soe$1.set( setter, observer, exp, handler );
}

/**
 * @function watch
 * To watch changes of an expression or a function of an observer.
 */
function watch( observer, exp, handler ) {
    const fn = expression( exp );

    collector.start();
    const value = fn( observer );
    const setters = collector.stop();
    if( setters.length ) {
        for( let setter of setters ) {
            listen( setter, observer, exp, handler );
        }
    } else {
        /**
         * to set a listener with a NULL setter
         */
        listen( null, observer, exp, handler );
    }

    if( isPromise( value ) ) {
        value.then( val => setValue( observer, exp, val ) );
    } else {
        setValue( observer, exp, value );
    }
}

function unwatch( observer, exp, handler ) {
    soe$1.deleteHandler( observer, exp, handler );
}

function calc( observer, exp, defaultValue ) {
    const val = expression( exp )( observer );
    if( !isUndefined( defaultValue ) && ( val === null || isUndefined( val ) ) ) return defaultValue;
    return val;
}

/** 
 * @file to convert an object to an observer instance.
 */

const getKeys = Object.keys;
const isArray = Array.isArray;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const defineProperty = Object.defineProperty;
const setPrototypeOf = Object.setPrototypeOf;

const proto = Array.prototype;
const arrMethods = Object.create( proto);



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

let arrayTraverseTranslate = true;

[ 'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill' ].forEach( method => {

    const original = proto[ method ];

    defineProperty( arrMethods, method, {
        enumerable : false,
        writable : true,
        configurable : true,
        value() {
            const args = [ ...arguments ];
            const result = original.apply( this, args );
            let inserted, deleted;

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
                for( const item of deleted ) {
                    if( item && typeof item === 'object' ) {
                        eventcenter.emit( 'delete-property', item );
                    }
                }
            }

            if( inserted ) {
                for( let item of inserted ) {
                    if( item && typeof item === 'object' ) {
                        arrayTraverseTranslate && traverse( item );
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
        value( i, v, trans ) {
            if( i >= this.length ) {
                this.length = +i + 1;
            }
            arrayTraverseTranslate = trans;
            const res = this.splice( i, 1, v )[ 0 ];
            arrayTraverseTranslate = true;
            return res;
        }
    } );

    defineProperty( arrMethods, '$get', {
        enumerable : false,
        writable : true,
        configurable : true,
        value( i ) {
            const setter = this.__fake_setter;
            setter && collector.add( setter );
            return this[ i ];
        }
    } );

    defineProperty( arrMethods, '$length', {
        enumerable : false,
        writable : true,
        configurable : true,
        value( i ) {
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
    const descriptor = getOwnPropertyDescriptor( obj, key );
    /**
     * if the configurable of the property is false,
     * the property cannot be translated
     */
    if( descriptor && !descriptor.configurable ) return;

    const setter = descriptor && descriptor.set;

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

    const getter = descriptor && descriptor.get;

    const set = function OBSERVER_SETTER( v ) {
        const value = getter ? getter.call( obj ) : val;
        /**
         * Setting the same value will not call the setter.
         */
        if( v === value ) return;

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

    const get = function OBSERVER_GETTER() {
        collector.add( set );   
        return getter ? getter.call( obj ) : val;
    };

    defineProperty( obj, key, {
        enumerable : descriptor ? descriptor.enumerable : true,
        configurable : true,
        set,
        get
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

    const isarr = isArray( obj );

    if( isarr ) {
        setPrototypeOf( obj, arrMethods );
        for( let i = 0, l = obj.length; i < l; i += 1 ) {
            const item = obj[ i ];

            if( item && typeof item === 'object' ) {
                traverse( item );
            }
        }
    }

    const keys = getKeys( obj );

    for( let key of keys ) {
        const val = obj[ key ];
        // to skip translating the indexes of array
        if( isarr && isInteger( key ) && key >= 0 && key < obj.length ) continue;

        translate( obj, key, val );

        if( val && typeof val === 'object' ) {
            traverse( val );
        }
    }
}

const Observer = {
    create( obj, proto ) {
        if( obj.__observer ) return obj;

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
    set( obj, key, value, trans = true, mute = false ) {

        /**
         * if the object is an array and the key is a integer, set the value with [].$set
         */
        if( isArray( obj ) && isInteger( key, true ) ) {
            return obj.$set( key, value, trans );
        }

        const old = obj[ key ];

        if( old && typeof old === 'object' ) {
            ec.emit( 'overwrite-object', value, old );
        }

        const isobj = value && typeof value === 'object';

        /**
         * to add the property to the specified object and to translate it to the format of observer.
         */
        translate( obj, key, value );
        /**
         * if the value is an object, to traverse the object with all paths in all observers
         */
        isobj && trans && traverse( value );
        eventcenter.emit( 'set-value', obj, key, value, old, mute );
    },

    /**
     * @function delete
     * To delete an property from
     *
     * - delete all relevant data, storing in each map, for both the specified property and its sub/descandant object.
     * -
     */
    delete( obj, key ) {
        const old = obj[ key ];
        const descriptor = Object.getOwnPropertyDescriptor( obj, key );
        const setter = descriptor && descriptor.set;
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
    translated( obj, key ) {
        const descriptor = Object.getOwnPropertyDescriptor( obj, key );
        if( descriptor && !descriptor.configurable ) {
            return false;
        }
        const setter = descriptor && descriptor.set;
        return !!( setter && isObserverSetter( setter ) );
    },

    is( observer ) {
        return observer.__observer || false;
    },

    watch( observer, exp, handler ) {
        watch( observer, exp, handler );
    },

    unwatch( observer, exp, handler ) {
        unwatch( observer, exp, handler );
    },

    calc( observer, exp, defaultValue ) {
        return calc( observer, exp, defaultValue );
    },

    replace( observer, data ) {
        for( const key of Object.keys( observer ) ) {
            if( !data.hasOwnProperty( key ) ) {
                Observer.delete( observer, key );
            }
        }

        for( const key of Object.keys( data ) ) {
            if( observer.hasOwnProperty( key ) ) {
                observer[ key ] = data[ key ];
            } else {
                Observer.set( observer, key, data[ key ] );
            }
        }
        return observer;
    },

    destroy( observer ) {
        eventcenter.emit( 'destroy-observer', observer );
    }
};

module.exports = Observer;
