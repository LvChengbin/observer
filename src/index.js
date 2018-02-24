import isInteger from '@lvchengbin/is/src/integer';
import utils from './utils';
import { addObject, addSetter, objects, deleteFromSetters, deleteFromObjects } from './maps';
import { watch, unwatch, ec } from './watch';
import { eventcenter } from './global';
import Collector from './collector';

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
 * 3. To translate one object in one observer multiple times
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
 *
 * 7. To use an observer as apart of another observer.
 *      const observer = new Observer( { x : 1 } ); 
 *      new Observer( { observer } );
 */

const getKeys = Object.keys;
const isArray = Array.isArray;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const defineProperty = Object.defineProperty;

//const proto = Array.prototype;
//const methods = Object.create( proto);



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

/**
[ 'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'fill' ].forEach( method => {

    const original = proto[ method ];

    defineProperty( methods, method, {
        enumerable : false,
        writable : true,
        configurable : true,
        value() {
            const args = [ ...arguments ];
            const result = original.apply( this, args );
            let inserted;

            switch( method ) {
                case 'push' :
                case 'unshift' :
                    inserted = args;
                    break;
                case 'splice' :
                    inserted = args.slice( 2 );
                    break;
                case 'fill' :
                    inserted = args[ 0 ];
                default :
                    break;
            }

            if( inserted ) {
            }
        }
    } );
} );
*/

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
function translate( obj, key, val, path, observer ) {
    const descriptor = getOwnPropertyDescriptor( obj, key );
    /**
     * if the configurable of the property is false,
     * the property cannot be translated
     */
    if( descriptor && !descriptor.configurable ) {
        return;
    }

    const setter = descriptor && descriptor.set;

    /**
     * The property has already transformed by Observer.
     * to add the observer and path into the map.
     */
    if( setter && utils.isObserverSetter( setter ) ) {
        /**
         * while translating a property of an object multiple times with different values,
         * The same setter should be used but to set the value to the new value.
         */
        obj[ key ] = val;
        return addSetter( setter, observer, path );
    }

    const getter = descriptor && descriptor.get;

    const set = function OBSERVER_SETTER( v ) {
        const value = getter ? getter.call( obj ) : val;
        /**
         * Setting the same value will not call the setter.
         */
        if( v === value ) return;

        //console.log( `[Observer setter]: ${path}` );
        
        if( setter ) {
            setter.call( obj, v );
        } else {
            /**
             * if the old value is an object, call remove function
             */
            if( value && typeof value === 'object' ) {
                remove( obj, key );
            }
            val = v;

            /**
             * if the new value is an object, to set the new value with Observer.set method.
             * it should be set to all observers which are using this object.
             */
            if( v && typeof v === 'object' ) {
                Observer.set( obj, key, v );
            }
        }
        ec.emit( set );
    };

    /**
     * add the setter into the setters map
     */
    addSetter( set, observer, path );

    const get = function OBSERVER_GETTER() {
        Collector.add( set );   
        return getter ? getter.call( obj ) : val;
    };

    defineProperty( obj, key, {
        enumerable : descriptor ? descriptor.enumerable : true,
        configurable : true,
        set,
        get
    } );
}

/**
 * @function traverse
 * To traverse and translate an object.
 *
 * @param {Object} obj
 * @param {Observer} observer
 * @param {String} base
 */
function traverse( obj, observer, base ) {

    /**
     * to add current object into the objects map
     */
    addObject( obj, observer, base );

    const isarr = isArray( obj );

    if( isarr ) {
        for( let i = 0, l = obj.length; i < l; i += 1 ) {
            const item = obj[ i ];

            if( item && typeof item === 'object' ) {
                traverse( item, observer, `${base}[${i}]` );
            }
        }
    }

    const keys = getKeys( obj );

    for( let key of keys ) {
        const val = obj[ key ];
        // to skip translating the indexes of array
        if( isarr && isInteger( key ) && key >= 0 && key < obj.length ) continue;

        const path = base ? base + '.' + key : key;

        translate( obj, key, val, path, observer );

        if( val && typeof val === 'object' ) {
            traverse( val, observer, path );
        }
    }
}

/**
 * @todo to remove listeners from eventcenter
 * @todo to remove data from an array
 */
function remove( obj, key ) {
    /**
     * getting all {observer, path} object from objects map,
     * so that it is able to get the path of the property which is going to be deleted,
     * and then, to delete data storing in setters map.
     */
    const list = objects.get( obj );

    /**
     * To remove all data stored in setters map
     */
    for( let item of list ) {
        deleteFromSetters( item.observer, item.path ? item.path + '.' + key : key );
    }

    /**
     * if the value of the property is an object, delete all data being stored in objects map.
     * this process have to be executed after removing all data in the setters map,
     * otherwise, the data in setters map cannot be deleted clearly,
     * because some paths will be removed in this step before using them.
     */
    if( obj[ key ] && typeof obj[ key ] === 'object' ) {
        for( let item of list ) {
            deleteFromObjects( item.observer, item.path ? item.path + '.' + key : key );
        }
    }
}

const Observer = {
    create( obj, proto ) {
        traverse( obj, obj );
        if( proto ) {
            Object.setPrototypeOf( obj, proto );
        }
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
    set( obj, key, value ) {
        const list = objects.get( obj );

        /**
         * The object must be translated before.
         */
        if( !list ) {
            throw new TypeError( 'The object has not been translated by observer.' );
        }

        const isobj = value && typeof value === 'object';

        for( let item of list ) {
            /**
             * to add the property to the specified object and to translate it to the format of observer.
             */
            translate( obj, key, value, item.path ? item.path + '.' + key : key, item.observer );
            /**
             * if the value is an object, to traverse the object with all paths in all observers
             */
            if( isobj ) {
                traverse( value, item.observer, item.path ? item.path + '.' + key : key );
            }
        }

        eventcenter.emit( 'set-value', obj, key, value );
    },

    /**
     * @function delete
     * To delete an property from
     *
     * - delete all relevant data, storing in each map, for both the specified property and its sub/descandant object.
     * -
     */
    delete( obj, key ) {
        remove( obj, key );
        delete obj[ key ];
        eventcenter.emit( 'delete-property', obj, key );
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
        return !!( setter && utils.isObserverSetter( setter ) );
    },

    watch( observer, exp, handler ) {
        watch( observer, exp, handler );
    },

    unwatch( observer, exp, handler ) {
        unwatch( observer, exp, handler );
    }
};


export default Observer;
