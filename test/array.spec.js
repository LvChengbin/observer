import Observer from '../src/index';

describe( 'Array', () => {
    describe( 'Observer.watch', () => {
        it( 'working with simple array', done => {
            const observer = Observer.create( { arr : [ 1, 'a', true, { x : 1 } ] } );

            Observer.watch( observer, 'arr[0] + arr[3].x', ( value, oldvalue ) => {
                expect( value ).toEqual( 3 );
                expect( oldvalue ).toEqual( 2 );
                done();
            } );

            observer.arr.$set( 0, 2 );
        } );

        it( 'working with array with object', done => {
            const observer = Observer.create( { arr : [ 1, 'a', true, { x : 1 } ] } );

            Observer.watch( observer, 'arr[0] + arr[3].x', ( value, oldvalue ) => {
                expect( value ).toEqual( 3 );
                expect( oldvalue ).toEqual( 2 );
                done();
            } );

            observer.arr[ 3 ].x = 2;
        } );

        it( 'push', done => {
            const observer = Observer.create( { arr : [ 'a', 'b', 'c', 'd' ] } );

            Observer.watch( observer, 'arr.join(",")', ( value, oldvalue ) => {
                expect( value ).toEqual( 'a,b,c,d,e' );
                expect( oldvalue ).toEqual( 'a,b,c,d' );
                done();
            } );

            observer.arr.push( 'e' );
        } );

        it( 'pop', done => {
            const observer = Observer.create( { arr : [ 'a', 'b', 'c', 'd' ] } );

            Observer.watch( observer, 'arr.join(",")', ( value, oldvalue ) => {
                expect( value ).toEqual( 'a,b,c' );
                expect( oldvalue ).toEqual( 'a,b,c,d' );
                done();
            } );

            observer.arr.pop();
        } );

        it( 'shift', done => {
            const observer = Observer.create( { arr : [ 'a', 'b', 'c', 'd' ] } );

            Observer.watch( observer, 'arr.join(",")', ( value, oldvalue ) => {
                expect( value ).toEqual( 'b,c,d' );
                expect( oldvalue ).toEqual( 'a,b,c,d' );
                done();
            } );

            observer.arr.shift();
        } );

        it( 'unshift', done => {
            const observer = Observer.create( { arr : [ 'a', 'b', 'c', 'd' ] } );

            Observer.watch( observer, 'arr.join(",")', ( value, oldvalue ) => {
                expect( value ).toEqual( '0,a,b,c,d' );
                expect( oldvalue ).toEqual( 'a,b,c,d' );
                done();
            } );

            observer.arr.unshift( 0 );
        } );


        it( 'splice', done => {
            const observer = Observer.create( { arr : [ 'a', 'b', 'c', 'd' ] } );

            Observer.watch( observer, 'arr.join(",")', ( value, oldvalue ) => {
                expect( value ).toEqual( 'a,b,d' );
                expect( oldvalue ).toEqual( 'a,b,c,d' );
                done();
            } );

            observer.arr.splice( 2, 1 );
        } );

        it( 'sort', done => {
            const observer = Observer.create( { arr : [ 'd', 'c', 'b', 'a' ] } );

            Observer.watch( observer, 'arr.join(",")', ( value, oldvalue ) => {
                expect( value ).toEqual( 'a,b,c,d' );
                expect( oldvalue ).toEqual( 'd,c,b,a' );
                done();
            } );

            observer.arr.sort();
        } );

        it( 'reverse', done => {
            const observer = Observer.create( { arr : [ 'd', 'c', 'b', 'a' ] } );

            Observer.watch( observer, 'arr.join(",")', ( value, oldvalue ) => {
                expect( value ).toEqual( 'a,b,c,d' );
                expect( oldvalue ).toEqual( 'd,c,b,a' );
                done();
            } );

            observer.arr.reverse();
        } );

        it( 'fill', done => {
            const observer = Observer.create( { arr : [ 'd', 'c', 'b', 'a' ] } );

            Observer.watch( observer, 'arr.join(",")', ( value, oldvalue ) => {
                expect( value ).toEqual( 'd,c,x,a' );
                expect( oldvalue ).toEqual( 'd,c,b,a' );
                done();
            } );

            observer.arr.fill( 'x', 2, 3 );
        } );

        it( '$set', done => {
            const observer = Observer.create( { arr : [ 'd', 'c', 'b', 'a' ] } );

            Observer.watch( observer, 'arr.join(",")', ( value, oldvalue ) => {
                expect( value ).toEqual( 'd,c,x,a' );
                expect( oldvalue ).toEqual( 'd,c,b,a' );
                done();
            } );

            observer.arr.$set( 2, 'x' );
        } );

        it( '$length', done => {
            const observer = Observer.create( { arr : [ 'd', 'c', 'b', 'a' ] } );

            Observer.watch( observer, 'arr.join(",")', ( value, oldvalue ) => {
                expect( value ).toEqual( 'd,c' );
                expect( oldvalue ).toEqual( 'd,c,b,a' );
                done();
            } );

            observer.arr.$length( 2 );
        } );

        it( 'using array as the root object of the observer', done => {
            const observer = Observer.create( [ 'a', 'b', 'c' ] );

            Observer.watch( observer, ob => ob.$get( 0 ) + ob.$get( 1 ), ( value, oldvalue ) => {
                expect( value ).toEqual( '1b' );
                expect( oldvalue ).toEqual( 'ab' );
                done();
            } );

            observer.$set( 0, '1' );
        } );

        it( 'watching expression while using array as the root object of the observer', done => {
            const observer = Observer.create( [ 'a', 'b', 'c' ] );

            Observer.watch( observer, '$get(0) + $get(1)', ( value, oldvalue ) => {
                expect( value ).toEqual( '1b' );
                expect( oldvalue ).toEqual( 'ab' );
                done();
            } );

            observer.$set( 0, '1' );
        } );

        it( 'set array value with Observer.set', done => {
            const observer = Observer.create( [ 'a', 'b', 'c' ] );

            Observer.watch( observer, '$get(0) + $get(1)', ( value, oldvalue ) => {
                expect( value ).toEqual( '1b' );
                expect( oldvalue ).toEqual( 'ab' );
                done();
            } );

            Observer.set( observer, 0, '1' );
        } );
    } );
} );
