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

    if( !findInSetters( list, observer, path ) ) {
        list.push( { observer, path } );
    }

    setters.set( setter, list );
    return list;
}

function addObject( obj, observer, path ) {
    let list = objects.get( obj );

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
        const item = setters.get( key );
        /**
         * while deleting an item of a setter, all the paths start with the specified path should be deleted at the same time.
         * eg. while deleting "a.b", and then "a.b.c", "a.b.d", "a.b.c.d" would be useless in the same observer.
         * The relevant paths including:
         * a.b
         * a.b.*
         * a.b[n]
         */
        if( item.observer === observer && ( item.path === path || !item.path.indexOf( path + '.' ) || !item.path.indexOf( path + '[' ) ) ) {
            setters.delete( key );
        }
    }
}

export { addSetter, addObject, objects, setters, deleteFromSetters };
