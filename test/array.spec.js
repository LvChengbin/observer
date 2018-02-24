import Observer from '../src/index';

describe( 'Array', () => {
    describe( 'Observer.watch', () => {
        it( 'working with simple array', done => {
            const observer = Observer.create( { arr : [ 1, 'a', true, { x : 1 } ] } );

            Observer.watch( observer, 'arr[0]', ( value, oldvalue ) => {
                expect( value ).toEqual( 3 );
                expect( oldvalue ).toEqual( 2 );
                done();
            } );

            observer.arr[ 0 ] = 2;
        } );

        xit( 'working with array with object', done => {
            const observer = Observer.create( { arr : [ 1, 'a', true, { x : 1 } ] } );

            Observer.watch( observer, 'arr[0] + arr[3].x', ( value, oldvalue ) => {
                expect( value ).toEqual( 3 );
                expect( oldvalue ).toEqual( 2 );
                done();
            } );

            observer.arr[ 3 ].x = 2;
        } );
    } );
} );
