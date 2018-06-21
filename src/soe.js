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

export default { 
    set, getSetter, forEachExps, forEachAllObserver, 
    deleteSetter, deleteObserver, deleteSetterObserver, deleteHandler
};
