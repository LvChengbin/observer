import EventEmitter from '@lvchengbin/event-emitter';
import isFunction from '@lvchengbin/is/src/function';
import { eventcenter, collector } from './global';


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
eventcenter.on( 'delete-observer',  observer => {
    values.delete( observer );
} );

/**
 * while setting new data into an object in an observer, or deleting properties of objects in observers,
 * all callback function should be executed again to check if the changes would effect any expressions.
 */
const callAllCallbacks = () => {
    callbacks.forEach( cb => cb() );
};

eventcenter.on( 'set-value', callAllCallbacks );
eventcenter.on( 'delete-property', callAllCallbacks );

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

    if( !list ) {
        map.set( handler, [ { setter, callback } ] );
    }

    let exists = false;

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
            const oldvalue = setValue( observer, fn, value );

            if( oldvalue !== value ) {
                handler( value, oldvalue, observer );
            }
        };

    } else {

        let obj = caches.get( exp );
        let continuous;

        if( !obj ) {
            fn = expression( exp );
            continuous = /(&&)|(\|\|)|(\?.+?:)/.test( exp );
            caches.set( exp, { fn, continuous } );
        } else {
            fn = obj.fn;
            continuous = obj.continuous;
        }

        cb = () => {
            let value;
            if( continuous ) {
                collector.start();
                value = fn( observer );
                const setters = collector.stop();
                for( let setter of setters ) {
                    ec.on( setter, cb );
                }
            } else {
                value = fn( observer );
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
    setValue( observer, exp, value );

    /**
     * add the callback function to callbacks map, so that while changing data with Observer.set or Observer.delete all the callback functions should be executed.
     */
    callbacks.add( cb );
    /**
     * while start to watch a non-exists path in an observer,
     * no setters would be collected by collector, and it would make an lonely callback function in callbacks map
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

    let callback;
    for( let item of list ) {
        callback = item.callback;
        ec.removeListener( item.setter, item.callback );
    }

    callbacks.delete( callback );
}

export { watch, unwatch, ec };
