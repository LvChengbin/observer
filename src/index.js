/** 
 * @file to convert an object to an observer instance.
 *
 * There are several different situations about the translating:
 * 1. To translate a new object which has not been translated.
 *      const observer = new Observer({});
 *      
 * 2. To translate one observer multiple times.
 *      const observer = new Observer({});
 *      new Observer( observer );
 *
 *      - should not add the {observer, path} object into setters map again.
 *      
 * 3. To translate one object in a same observer multiple times
 *      const obj = {};
 *      new Observer( {
 *          x : obj,
 *          y : obj
 *      } );
 *
 *      - should add {observer, path} objects into setters map multiple times with different paths.
 *
 * 4. To translate one object in different observers multiple times.
 *      const obj = {};
 *      new Observer( { x : obj } );
 *      new Observer( { x : obj } );
 *
 *      - should add {observer, path} objects into setters map multiple times with different observers and paths.
 *
 * 5. To set a new object to a observer.
 *      const observer = new Observer( { x : 1 } );
 *      Observer.set( observer, 'y', {}, observer );
 *
 *      - should get all observers, from object maps, which are using the specified, and set the new object to all the observers.
 *      - should add {observer, path} object into setters map for the object in current observer
 *
 * 6. To change a value, of an object in an observer, to an object.
 *      const observer = new Observer({ x : 1 });
 *      observer.x = {};
 *
 *      - should get all observers which are using current object, and set the value to all the observer.
 *      - if the old value is a non-empty object, remove the old value and then set the new value
 */

import isInteger from '@lvchengbin/is/src/integer';
import utils from './utils';
import { addObject, addSetter } from './maps';

const getKeys = Object.keys;
const isArray = Array.isArray;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const defineProperty = Object.defineProperty;


/**
 * @function translate
 * To translate an property of an object to GETTER and SETTER.
 */
function translate( obj, key, val, path, dest, observer ) {
    const descriptor = getOwnPropertyDescriptor( obj, key );
    if( descriptor && !descriptor.configurable ) {
        return;
    }

    const setter = descriptor && descriptor.set;

    /**
     * The property has already transformed by Observer.
     * to add the observer and path into the map.
     */
    if( setter && utils.isObserverSetter( setter ) ) {
        return addSetter( setter, observer, path );
    }

    const getter = descriptor && descriptor.get;

    const set = function OBSERVER_SETTER( v ) {
        const value = getter ? getter.call( obj ) : val;
        /**
         * Setting the same value will not call the setter.
         */
        if( v === value ) return;

        console.log( `[Observer setter]: ${path}` );
        
        if( setter ) {
            setter.call( obj, v );
        } else {
            val = v;

            if( v && typeof v === 'object' ) {
                traverse( v, path );
            }
        }
    };

    const get = function OBSERVER_GETTER() {
        const v = getter ? getter.call( obj ) : val;
        console.log( `[Observer getter]: ${path}` );
        return v;
    };

    defineProperty( dest, key, {
        enumerable : true,
        configurable : true,
        set,
        get
    } );
}

function traverse( obj, base, dest, observer ) {

    dest || ( dest = obj );

    const list = addObject( dest, observer, base );

    const isarr = isArray( obj );

    if( isarr ) {
        console.log( obj );
    }

    const keys = getKeys( obj );

    for( let key of keys ) {
        const val = obj[ key ];
        // to skip the indexes of array
        if( isarr && isInteger( key ) && key >= 0 && key < obj.length ) {
            continue;
        }

        const path = base ? base + '.' + key : key;

        for( let item of list ) {
            translate( obj, key, val, item.path ? item.path + '.' + key : key, dest );
        }

        if( val && typeof val === 'object' ) {
            traverse( val, path, null, observer );
        }
    }
}

class Observer {
    constructor( obj, base ) {
        traverse( obj, base, this, this );
    }
}

Observer.set = ( obj, key, value, observer ) => {
    if( Observer.translated( obj, key ) ) {
        return obj.key = value;
    }
    traverse( { [ key ] : value }, null, obj, observer );
};

/**
 * @function translated 
 * to check if the property in the object has been translated to observer setter and getter
 *
 * @param {Object|Array} obj
 * @param {String|Integer} key The property name
 *
 */
Observer.translated = ( obj, key ) => {
    const descriptor = Object.getOwnPropertyDescriptor( obj, key );
    if( descriptor && !descriptor.configurable ) {
        return false;
    }
    const setter = descriptor && descriptor.set;
    return !!( setter && utils.isObserverSetter( setter ) );
};

Observer.is = observer => {
    return observer instanceof Observer;
};

Observer.isArray = ( observer ) => {
    return observer.__isarray;
};

export default Observer;
