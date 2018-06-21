import EventEmitter from '@lvchengbin/event-emitter';

export const eventcenter = new EventEmitter();

export const collector = {
    records : [],
    collecting : false,
    start() {
        this.records = [];
        this.collecting = true;
    },
    stop() {
        this.collecting = false;
        return this.records;
    },
    add( data ) {
        this.collecting && this.records.push( data );
    }
};

export function isSubset( obj, container ) {
    if( !obj || typeof obj !== 'object' ) return false;
    for( const prop in container ) {
        const item = container[ prop ];
        if( item === obj ) return true;

        if( item && typeof item === 'object' ) {
            const res = isSubset( obj, item );
            if( res ) return true;
        }
    }

    return false;
}
