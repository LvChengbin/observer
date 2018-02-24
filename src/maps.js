/**
 * a map for storing the relationships between setters, paths and observer instances.
 *
 * {
 *      [ setter ] : [ {
 *          observer,
 *          path
 *      } ]
 * }
 */

const setters = new Map();

/**
 * a map for storing the relationships between every object, observer instances and the path of the object in the observer instance.
 *
 * {
 *      [ object ] : [ 
 *          {
 *              observer,
 *              path
 *          },
 *          {
 *              observer,
 *              path
 *          }
 *      ]
 * }
 */

const objects = new Map();

function findInSetters( list, observer, path ) {
    for( const item of list ) {
        if( item.observer === observer && item.path === path ) {
            return true
        }
    }
    return false;
}

function findInObjects( list, observer, path ) {
    for( const item of list ) {
        if( item.observer === observer && item.path === path ) {
            return true;
        }
    }
    return false;
}

function addSetter( setter, observer, path ) {
    const list = setters.get( setter ) || [];

    path || ( path = '' );

    if( !findInSetters( list, observer, path ) ) {
        list.push( { observer, path } );
    }

    setters.set( setter, list );
    return list;
}

function addObject( obj, observer, path ) {
    let list = objects.get( obj );

    path || ( path = '' );

    if( list ) {
        if( findInObjects( list, observer, path ) ) {
            return list;
        }
        list.push( { observer, path } );
    } else {
        list = [ { observer, path } ];
    }

    objects.set( obj, list );

    return list;
}

/**
 * @function deleteFromSetters
 * To delete items in the {observer, path} object list of a setter from setters map
 */
function deleteFromSetters( observer, path ) {
    for( let key of setters.keys() ) {
        const list = setters.get( key );
        /**
         * while deleting an item of a setter, all the paths start with the specified path should be deleted at the same time.
         * eg. while deleting "a.b", and then "a.b.c", "a.b.d", "a.b.c.d" would be useless in the same observer.
         * The relevant paths including:
         * a.b
         * a.b.*
         * a.b[n]
         */
        for( let i = 0; i < list.length; i += 1 ) {
            const item = list[ i ];
            const p = item.path;

            if( item.observer === observer && ( p === path || !p.indexOf( path + '.' ) || !p.indexOf( path + '[' ) ) ) {
                list.splice( i--, 1 );
            }
        }
        setters.set( key, list );
    }
}

/**
 * @function deleteFromObjects
 * To delete item in the {observer, path} object list of an object from objects map.
 */
function deleteFromObjects( observer, path ) {
    for( let key of objects.keys() ) {
        const list = objects.get( key );

        for( let i = 0; i < list.length; i += 1 ) {
            const item = list[ i ];
            const p = item.path;


            if( item.observer === observer && ( p === path || !p.indexOf( path + '.' ) || !p.indexOf( path + '[' ) ) ) {
                list.splice( i--, 1 );
            }
        }

        objects.set( key, list );
    }
}

export { addSetter, addObject, objects, setters, deleteFromSetters, deleteFromObjects };
