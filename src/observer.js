import is from '@lvchengbin/is';

import { Record, eventcenter } from './utils';
import { getKeys, defineProperty, arrayPrototype as proto } from '../variables';
import { uniqueId } from '../utils';
import Value from '../value';

const methods = Object.create( proto );

[ 'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse' ].forEach( method => {

    const original = proto[ method ];

    defineProperty( methods, method, {
        value() {
            const args = [ ...arguments ];
            const result = original.apply( this, args );
            const ob = this.__ob;
            const path = ob.__path;
            let inserted;
            const insertedArgs = [];
            switch( method ) {
                case 'push' :
                case 'unshift' :
                    inserted = args;
                    break;
                case 'splice' :
                    insertedArgs.push( args[ 0 ] );
                    ( args[ 1 ] !== undefined ) && insertedArgs.push( args[ 1 ] );
                    inserted = args.slice( 2 );
                    break;
            }
            if( inserted ) {
                for( let item of inserted ) {
                    const id = uniqueId(); 
                    insertedArgs.push( id );
                    if( typeof item === 'object' ) {
                        traverse( item, path + '.[' + id + ']' );
                    }
                }
            }
            original.apply( ob.__subs, insertedArgs.length ? insertedArgs : args );
            mtrigger( this );
            eventcenter.$strigger( path, this, this, path );
            return result;
        },
        enumerable : false,
        writable : true,
        configurable : true
    } );

    defineProperty( methods, '$set', {
        value( i, v ) {
            if( i >= this.length ) {
                this.length = +i + 1;
            }
            return this.splice( i, 1, v )[ 0 ];
        },
        enumerable : false,
        writable : true,
        configurable : true
    } );
} );

function bindProto( arr ) {
    if( '__proto__' in {} ) {
        /* jshint proto: true */
        arr.__proto__ = methods;
        /* jshint proto: false */
    }
    const keys = Object.getOwnPropertyNames( methods );
    for( let i = 0, l = keys.length; i < l; i = i + 1 ) {
        defineProperty( arr, keys[ i ], {
            value : methods[ keys[ i ] ]
        } );
    }
}

function subscope( dest, key, val ) {
    defineProperty( dest, key, {
        enumerable : true,
        configurable : true,
        set : function J_OB_SETTER( v ) {
            const data = val.data();
            val.arr ? data.$set( val.path, v ) : ( data[ val.path ] = v );
        },
        get : function J_OB_GETTER() {
            const data = val.data();
            if( Record.node && val.arr ) {
                const ob = data.__ob;
                if( ob ) {
                    Record.set( val.__ob ? val.__ob.__path : ( ob.__path + '[' +  ob.__subs[ val.path ] + ']' ) );
                }
            }
            return data[ val.path ];
        }
    } );
}

function translate( obj, key, val, dest ) {
    // skip properties start with double underline
    if( key.charAt( 0 ) === '_' && key.charAt( 1 ) === '_' ) return;
    if( !dest ) {
        dest = obj;
    }
    const ob = dest.__ob;
    const path = ob[ key ];

    const descriptor = Object.getOwnPropertyDescriptor( obj, key );
    if( descriptor && !descriptor.configurable ) return;
    const setter = descriptor && descriptor.set;
    const getter = descriptor && descriptor.get;

    if( val && val.__var ) {
        subscope( dest, key, val );
    } else {
        defineProperty( dest, key, {
            enumerable : true,
            configurable : true,
            set : function J_OB_SETTER( v ) {
                const value = getter ? getter.call( obj ) : val; 
                let special = null;
                if( v instanceof Value ) {
                    special = v;
                    v = v.value;
                }
                if( v === value ) return;
                console.log( '[J Observer] SET : ', path );
                const isArr = is.array( val );
                if( setter ) {
                    setter.call( obj, special || v  );
                    eventcenter.$strigger( path, v, value, path, special );
                } else {
                    val = v;
                    if( typeof v === 'object' && v !== null ) {
                        traverse( v, path );
                        isArr || traverseTrigger( v );
                        eventcenter.$strigger( path, v, value, path, special );
                    } else {
                        eventcenter.$strigger( path, v, value, path, special );
                    }
                }
            },
            get : function J_OB_GETTER() {
                const v = getter ? getter.call( obj ) : val;
                Record.node && Record.set( path );
                return v;
            }
        } );
    }
}

function mtrigger( obj ) {
    if( typeof obj !== 'object' ) return;
    const paths = obj.__ob.__paths;

    for( let i = 0, l = paths.length; i < l; i += 1 ) {
        eventcenter.$strigger( paths[ i ], obj, obj, paths[ i ] );
    }
}

function traverseTrigger( obj ) {
    const isarr = is.array( obj );

    if( isarr ) {
        for( let i = 0, l = obj.length; i < l; i = i + 1 ) {
            const path = obj.__ob.__path + '[' + obj.__ob.__subs[ i ] + ']';
            eventcenter.$strigger( path, obj[ i ], obj[ i ], path );
            typeof obj[ i ]=== 'object' && traverseTrigger( obj[ i ] );
        }
    }
    const keys = getKeys( obj );
    for( let i = 0, l = keys.length; i < l; i = i + 1 ) {
        const key = keys[ i ];
        const val = obj[ key ];
        if( isarr && ( Math.floor( key ) == key ) ) continue;
        const path = obj.__ob[ key ];
        eventcenter.$strigger( path, val, val, path );
        ( typeof val === 'object' && val && !val.__var ) && traverseTrigger( val );
    }
}

function traverse( obj, base, dest ) {
    dest || ( dest = obj );
    base || ( base = dest.__ob && dest.__ob.__path || '' );
    dest.__ob || defineProperty( dest, '__ob', {
        enumerable : false,
        writable : false,
        value : {}
    } );

    const ob = dest.__ob;
    ob.__path = base;
    if( ob.__paths ) {
        ob.__paths.indexOf( base ) < 0 && ob.__paths.push( base );
    } else {
        ob.__paths = [ base ];
    }
    const isarr = is.array( obj );

    if( isarr ) {
        const subs = ob.__subs = [];
        bindProto( obj );
        for( let i = 0, l = obj.length; i < l; i = i + 1 ) {
            const id = uniqueId();
            const item = obj[ i ];
            subs.push( id );
            if( typeof item === 'object' ) {
                traverse( obj[i], base + '[' + id + ']' );
            }
        }
    }
    const keys = getKeys( obj );
    for( let i = 0, l = keys.length; i < l; i = i + 1 ) {
        const key = keys[ i ];
        const val = obj[ key ];
        if( isarr && ( Math.floor( key ) == key ) ) continue;
        const path = base ? base + '.' + key : key;
        ob[ key ] = path;
        is.function( val ) || translate( obj, key, val, dest );
        ( typeof val === 'object' && val && !val.__var ) && traverse( val, path );
    }
    return dest;
}

function observer( obj, id, inherit ) {
    const Observer = function( obj ) {
        traverse( obj, id, this );
    };
    inherit && ( Observer.prototype = inherit );
    return new Observer( obj );
}

export { traverse, observer, subscope, mtrigger };
