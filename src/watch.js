import EventEmitter from '@lvchengbin/event-emitter';
import isFunction from '@lvchengbin/is/src/function';
import isPromise from '@lvchengbin/is/src/promise';
import isUndefined from '@lvchengbin/is/src/undefined';
import { eventcenter, collector, isSubset } from './global';
import soe from './soe';

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
    soe.deleteObserver( observer );
} );

/**
 * while setting new data into an object in an observer, or deleting properties of objects in observers,
 * all callback function should be executed again to check if the changes would effect any expressions.
 */
eventcenter.on( 'set-value', () => {
    // to execute all expressions after deleting a property from an observer.
    soe.forEachAllObserver( execute );
} );

/**
 * to remove useless listeners for release memory.
 */
const gc = ( obj ) => {
    if( !obj || typeof obj !== 'object' ) return;
    const keys = Object.keys;
    const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    soe.forEachAllObserver( observer => {
        if( isSubset( obj, observer ) ) return;
        for( let key of keys( obj ) ) {
            const descriptor = getOwnPropertyDescriptor( obj, key ); 
            const setter = descriptor && descriptor.set;
            if( !setter ) continue;
            soe.deleteSetterObserver( setter, observer );
            const item = obj[ key ];
            item && typeof item === 'object' && gc( item );
        }
    } );
};

eventcenter.on( 'overwrite-object', ( val, old ) => gc( old ) );

eventcenter.on( 'delete-property', ( deleted, setter ) => {
    // to execute all expressions after deleting a property from an observer.
    soe.forEachAllObserver( execute );
    soe.deleteSetter( setter );
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
    let oldvalue;
    let map = values.get( observer );
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
    if( !soe.getSetter( setter ) ) {
        /**
         * to bind event on the setter
         */
        ec.on( setter, () => soe.forEachExps( setter, execute ) );
    }
    soe.set( setter, observer, exp, handler );
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
    soe.deleteHandler( observer, exp, handler );
}

function calc( observer, exp, defaultValue ) {
    const val = expression( exp )( observer );
    if( !isUndefined( defaultValue ) && ( val === null || isUndefined( val ) ) ) return defaultValue;
    return val;
}

export { watch, unwatch, ec, calc };
