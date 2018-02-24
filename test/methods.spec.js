import Observer from '../src/index';

describe( 'Observer methods', () => {
    it( 'Observer.translated', () => {
        const observer = Observer.create( {
            x : 1,
            obj : {
                m : 'm',
                sub : {
                    a : null
                }
            }
        } );

        expect( Observer.translated( observer, 'x' ) ).toBeTruthy();
        expect( Observer.translated( observer.obj, 'm' ) ).toBeTruthy();
        expect( Observer.translated( observer.obj.sub, 'a' ) ).toBeTruthy();

        const obj = {
            x : 1
        };

        expect( Observer.translated( obj, 'x' ) ).toBeFalsy();
    } );

    it( 'Observer.set', () => {
        const observer = Observer.create( {
            key : 'value',
            obj : {}
        } );

        Observer.set( observer, 'key', 'new value' );
        expect( observer.key ).toEqual( 'new value' );

        Observer.set( observer, 'key1', 'value1' );
        expect( observer.key1 ).toEqual( 'value1' );
        expect( Observer.translated( observer, 'key1' ) ).toBeTruthy();

        Observer.set( observer.obj, 'x', 1 );
        expect( observer.obj.x ).toEqual( 1 );
        expect( Observer.translated( observer.obj, 'x' ) ).toBeTruthy();
    } );

    describe( 'Observer.watch', () => {
        it( 'should execute callback after the value of the expression changed', done => {
            const observer = Observer.create( {
                obj : {
                    x : 1
                }
            } );

            Observer.watch( observer, 'obj.x', ( value, oldvalue, ob, exp ) => {
                expect( value ).toEqual( 2 );
                expect( oldvalue ).toEqual( 1 );
                expect( ob ).toEqual( observer );
                expect( exp ).toEqual( 'obj.x' );
                done();
            } );

            observer.obj.x = 2;

        } );

        it( 'complex expression', done => {
            const observer = Observer.create( {
                m : 0,
                obj : {
                    x : 1
                }
            } );

            Observer.watch( observer, 'obj.x + m', ( value, oldvalue ) => {
                expect( value ).toEqual( 2 );
                expect( oldvalue ).toEqual( 1 );
                done();
            } );
            observer.m = 1;
        } );

        it( 'to watch expressions with && operator', done => {
            let i = 0;
            const observer = Observer.create( {
                b : false,
                obj : {
                    x : 1
                }
            } );
            Observer.watch( observer, 'b && obj.x', ( value, oldvalue ) => {
                if( !i ) {
                    expect( value ).toEqual( 2 );
                    expect( oldvalue ).toBeFalsy();
                }
                if( i === 1 ) {
                    expect( value ).toEqual( 3 );
                    expect( oldvalue ).toEqual( 2 );
                    done();
                }
                i++;
            } );

            observer.obj.x = 2;
            observer.b = true;
            observer.obj.x = 3;
        } );

        it( 'to watch expressions with || operator', done => {
            let i = 0;
            const observer = Observer.create( {
                b : true,
                obj : {
                    x : 1
                }
            } );
            Observer.watch( observer, 'b || obj.x', ( value, oldvalue ) => {
                if( !i ) {
                    expect( value ).toEqual( 2 );
                    expect( oldvalue ).toBeTruthy();
                }
                if( i === 1 ) {
                    expect( value ).toEqual( 3 );
                    expect( oldvalue ).toEqual( 2 );
                    done();
                }
                i++;
            } );

            observer.obj.x = 2;
            observer.b = false;
            observer.obj.x = 3;
        } );

        it( 'to watch expressions with ?: operator', done => {
            let i = 0;
            const observer = Observer.create( {
                b : true,
                obj : {
                    x : 'x',
                    y : 'y'
                }
            } );
            Observer.watch( observer, 'b ? obj.x : obj.y', ( value, oldvalue ) => {
                if( !i ) {
                    expect( value ).toEqual( 2 );
                    expect( oldvalue ).toEqual( 'x' );
                }
                if( i === 1 ) {
                    expect( value ).toEqual( 'y'  );
                    expect( oldvalue ).toEqual( 2 );
                    done();
                }
                i++;
            } );

            observer.obj.x = 2;
            observer.b = false;
            observer.obj.x = 3;
        } );

        it( 'Observer.set should also trigger the event', done => {
            const observer = Observer.create( {} );
            Observer.watch( observer, 'obj.x', ( value, oldvalue ) => {
                expect( value ).toEqual( 1  );
                expect( oldvalue ).toEqual( null );
                done();
            } );

            Observer.set( observer, 'obj', {
                x : 1
            } );
        } );

        it( 'to set a simple property', done => {
            const observer = Observer.create( { obj : {} } );
            Observer.watch( observer, 'obj.x + 1', ( value, oldvalue ) => {
                expect( value ).toEqual( 2  );
                expect( oldvalue ).toBeNaN();
                done();
            } );

            Observer.set( observer.obj, 'x', 1 );
        } );

        it( 'change a complete expression to be incomplete', done => {
            let i = 0;

            const observer = Observer.create( { obj : { x : 1 } } );
            Observer.watch( observer, 'obj.x + 1', ( value, oldvalue ) => {
                if( !i ) {
                    expect( value ).toBeNaN();
                    expect( oldvalue ).toEqual( 2 );
                }
                if( i === 1 ) {
                    expect( value ).toEqual( 3 );
                    expect( oldvalue ).toBeNaN();
                    done();
                }
                i++;
            } );

            observer.obj = 1;
            Observer.set( observer, 'obj', { x : 2 } );
        } );

        it( 'should work with Observer.delete', done => {
            const observer = Observer.create( { x : 1 } );

            Observer.watch( observer, 'x', ( value, oldvalue ) => {
                expect( value ).toEqual( null );
                expect( oldvalue ).toEqual( 1 );
                done();
            } );

            Observer.delete( observer, 'x' );
        } );

        it( 'should work well with data from inheritance', done => {
            const observer = Observer.create( {
                x : 'x'
            } );

            const sub = Observer.create( {
                m : 'm'
            }, observer );

            Observer.watch( sub, 'x + m', ( value, oldvalue ) => {
                expect( value ).toEqual( 'ym' );
                expect( oldvalue ).toEqual( 'xm' );
                done();
            } );

            observer.x = 'y';
        } );
    } );

    describe( 'Observer.unwatch', () => {

        it( 'should remove the listener after calling unwatch', () => {

            let i = 0;

            const observer = Observer.create( { x : 1 } );

            const handler = () => i++;

            Observer.watch( observer, 'x', handler );

            observer.x = 2;

            Observer.unwatch( observer, 'x', handler );
            observer.x = 3;

            expect( i ).toEqual( 1 );
        } );

        it( 'should not trigger event which calling Observer.set after calling unwatch', () => {

            let i = 0;

            const observer = Observer.create( { x : 1 } );

            const handler = () => i++;

            Observer.watch( observer, 'y', handler );
            Observer.unwatch( observer, 'y', handler );
            Observer.set( observer, 'y', 1 );

            expect( i ).toEqual( 0 );
        } );
    } );

} );

