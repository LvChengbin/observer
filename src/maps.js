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
        list.push( { observer, path } );
    } else {
        list = [ { observer, path } ];
    }

    objects.set( obj, list );

    return list;
}

export { addSetter, addObject };
