import EventEmitter from '@lvchengbin/event-emitter';
import isFunction from '@lvchengbin/is/src/function';
import isPromise from '@lvchengbin/is/src/promise';
import isUndefined from '@lvchengbin/is/src/undefined';
import { eventcenter, collector, isSubset } from './global';

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
 * a Set for storing all callback functions
 */
const callbacks = new Set();

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
const handlers = new Map();


/**
 * To do some preparations while adding a new observer.
 */
eventcenter.on( 'add-observer', observer => {
    if( !values.get( observer ) ) {
        values.set( observer, new Map() );
    }
    if( !handlers.get( observer ) ) {
        handlers.set( observer, new Map() );
    }
} );

/**
 * Processes after deleting an observer.
 */
eventcenter.on( 'destroy-observer',  observer => {
    const map = handlers.get( observer );

    map.forEach( hmap => {
        hmap.forEach( value => {
            if( !value.length ) return;
            for( const item of value ) {
                ec.removeListener( item.setter, item.callback );
            }
            callbacks.delete( value[ 0 ].callback );
        } ); 
    } )

    handlers.set( observer, new Map() );
    values.set( observer, new Map() );
} );

/**
 * while setting new data into an object in an observer, or deleting properties of objects in observers,
 * all callback function should be executed again to check if the changes would effect any expressions.
 */
eventcenter.on( 'set-value', () => {
    callbacks.forEach( cb => cb() );
} );

/**
 * to delete relevent data of a setter of an observer, for releasing useless memory.
 */
const deleteSetterFromObserver = ( observer, setter ) => {
    const ob = handlers.get( observer );
    if( !ob ) return;

    ob.forEach( val => {
        val.forEach( value => {
            for( let i = 0, l = value.length; i < l; i += 1 ) {
                const item = value[ i ];
                if( item.setter === setter ) {
                    ec.removeListener( setter, item.callback );
                    callbacks.delete( item.callback );
                    value.splice( i--, 1 );
                    l--;
                }
            }
        } );
    } );
}

/**
 * to remove useless listeners for release memory.
 */
const gc = ( obj, keys ) => {

    if( !obj || typeof obj !== 'object' ) return;

    handlers.forEach( ( v, observer ) => {
        if( isSubset( obj, observer ) ) return;

        if( !keys ) {
            keys = Object.keys( obj );
        }
        
        for( const key of keys ) {
            const descriptor = Object.getOwnPropertyDescriptor( obj, key );
            const setter = descriptor && descriptor.set;
            if( !setter ) continue;
            deleteSetterFromObserver( observer, setter );
            const item = obj[ key ];
            if( item && typeof item === 'object' ) {
                gc( item );
            }
        }
    } );
};

eventcenter.on( 'overwrite-object', ( val, old ) => {
    gc( old );
} );

eventcenter.on( 'delete-property', ( deleted, setter ) => {
    callbacks.forEach( cb => cb() );
    setter && handlers.forEach( ( v, observer ) => {
        deleteSetterFromObserver( observer, setter );
    } );
    gc( deleted );
} );

/**
 * @function expression
 * To convert the expression to a function.
 *
 * @param {Function|String} exp
 */
function expression( exp ) {
    return new Function( 's', 'try{with(s)return ' + exp + '}catch(e){return null}' );
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

function setHandler( observer, exp, handler, setter, callback ) {
    const expressions = handlers.get( observer );

    let map = expressions.get( exp );

    if( !map ) {
        map = new Map();
        map.set( handler, [ { setter, callback } ] );
        expressions.set( exp, map );
        return;
    }

    const list = map.get( handler );

    let exists = false;

    if( !list ) {
        map.set( handler, [ { setter, callback } ] );
        return;
    }
    for( let item of list ) {
        if( item.setter === setter && item.callback === callback ) {
            exists = true;
            break;
        }
    }
    if( !exists ) {
        list.push( { setter, callback } );
    }
}

/**
 * @function watch
 * To watch changes of an expression or a function of an observer.
 */
function watch( observer, exp, handler ) {

    let cb, setters, fn;

    if( isFunction( exp ) ) {
        fn = exp;
        cb = () => {
            collector.start();
            const value = fn( observer );
            const setters = collector.stop();
            for( let setter of setters ) {
                ec.on( setter, cb );
            }

            if( isPromise( value ) ) {
                value.then( val => {
                    const oldvalue = setValue( observer, fn, val );

                    if( oldvalue !== val ) {
                        handler( val, oldvalue, observer );
                    }
                } );
            } else {
                const oldvalue = setValue( observer, fn, value );
                if( oldvalue !== value ) {
                    handler( value, oldvalue, observer );
                }
            }
        };

    } else {

        fn = caches.get( exp );

        if( !fn ) {
            fn = expression( exp );
            caches.set( exp, fn );
        }

        cb = () => {
            let value;
            collector.start();
            value = fn( observer );
            const setters = collector.stop();
            for( let setter of setters ) {
                ec.on( setter, cb );
            }
            const oldvalue = setValue( observer, exp, value );
            
            if( oldvalue !== value ) {
                handler( value, oldvalue, observer, exp );
            }
        };
    }

    collector.start();
    const value = fn( observer );
    setters = collector.stop();
    if( isPromise( value ) ) {
        value.then( val => setValue( observer, exp, val ) );
    } else {
        setValue( observer, exp, value );
    }

    /**
     * add the callback function to callbacks map, so that while changing data with Observer.set or Observer.delete all the callback functions should be executed.
     */
    callbacks.add( cb );
    /**
     * while start to watch a non-exists path in an observer,
     * no setters would be collected by collector, and it would make an alone callback function in callbacks map
     * which cannot be found by handler, so, it cannot be removed while calling Observer.unwatch.
     * To add a handler with its setter is null can resolve this issue.
     */
    setHandler( observer, exp, handler, null, cb );

    for( let setter of setters ) {
        ec.on( setter, cb );
        setHandler( observer, exp, handler, setter, cb );
    }
}

function unwatch( observer, exp, handler ) {
    let map = handlers.get( observer );
    if( !map ) return;
    map = map.get( exp );
    if( !map ) return;
    const list = map.get( handler );
    if( !list ) return;

    for( let item of list ) {
        ec.removeListener( item.setter, item.callback );
    }

    map.delete( handler );
    callbacks.delete( list[ 0 ].callback );
}

function calc( observer, exp, defaultValue ) {
    const val = expression( exp )( observer );
    if( !isUndefined( defaultValue ) && ( val === null || isUndefined( val ) ) ) {
        return defaultValue;
    }
    return val;
}

export { watch, unwatch, ec, calc };
