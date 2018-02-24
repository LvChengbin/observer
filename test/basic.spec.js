import is from '@lvchengbin/is';
import Observer from '../src/index';

describe( 'Observer', () => {
    describe( 'Basic features', () => {
        it( 'Should created an Observer instance with an Object', () => {
            const observer = Observer.create( {} );
            expect( is.empty( observer ) ).toBeTruthy();
        } );

        it( 'Should create an Observer instance with an Array', () => {
            const observer = Observer.create( [] );
            expect( is.empty( observer ) ).toBeTruthy();
            expect( is.array( observer ) ).toBeTruthy();
        } );

        it( 'Should have same structure with the original object', () => {
            const observer = Observer.create( {
                x : 1,
                y : 2,
                obj : {
                    m : 'm',
                    n : 'n',
                    sub : {
                        a : null,
                        b : undefined,
                        c : true
                    }
                },
                func( str ) {
                    return str;
                }
            } );
            expect( observer.x ).toEqual( 1 );
            expect( observer.y ).toEqual( 2 );
            expect( observer.obj.m ).toEqual( 'm' );
            expect( observer.obj.n ).toEqual( 'n' );
            expect( observer.obj.sub.a ).toEqual( null );
            expect( observer.obj.sub.b ).toEqual( undefined );
            expect( observer.obj.sub.c ).toEqual( true );
            expect( is.function( observer.func ) ).toBeTruthy();
            expect( observer.func( 'abc' ) ).toEqual( 'abc' );
        } );

        it( 'translate one observer multiple times', () => {
            const observer = Observer.create( {
                x : 1,
                y : 2
            } );
            const observer2 = Observer.create( observer );

            expect( observer.x ).toEqual( 1 );
            expect( observer.y ).toEqual( 2 );
            expect( observer2.x ).toEqual( 1 );
            expect( observer2.y ).toEqual( 2 );

            observer.x = 3;

            expect( observer.x ).toEqual( 3 );
            expect( observer2.x ).toEqual( 3 );
        } );

        it( 'translate an observer in one observer multiple times', () => {
            const obj = { x : 1 };
            const observer = Observer.create( {
                a : obj,
                b : obj,
                obj
            } );

            expect( observer.a.x ).toEqual( 1 );
            expect( Observer.translated( observer.a, 'x' ) ).toBeTruthy();
            expect( observer.b.x ).toEqual( 1 );
            expect( Observer.translated( observer.b, 'x' ) ).toBeTruthy();
            expect( observer.obj.x ).toEqual( 1 );
            expect( Observer.translated( observer.obj, 'x' ) ).toBeTruthy();

            obj.x = 2;

            expect( observer.a.x ).toEqual( 2 );
            expect( Observer.translated( observer.a, 'x' ) ).toBeTruthy();
            expect( observer.b.x ).toEqual( 2 );
            expect( Observer.translated( observer.b, 'x' ) ).toBeTruthy();
            expect( observer.obj.x ).toEqual( 2 );
            expect( Observer.translated( observer.obj, 'x' ) ).toBeTruthy();

            observer.a.x = 100;

            expect( observer.a.x ).toEqual( 100 );
            expect( Observer.translated( observer.a, 'x' ) ).toBeTruthy();
            expect( observer.b.x ).toEqual( 100 );
            expect( Observer.translated( observer.b, 'x' ) ).toBeTruthy();
            expect( observer.obj.x ).toEqual( 100 );
            expect( Observer.translated( observer.obj, 'x' ) ).toBeTruthy();
        } );

        it( 'translate an object in different observers', () => {
            const obj = { x : 1 };
            const observer1 = Observer.create( { a : obj } );
            const observer2 = Observer.create( { a : obj } );

            expect( observer1.a.x ).toEqual( 1 );
            expect( observer2.a.x ).toEqual( 1 );

            expect( Observer.translated( observer1.a, 'x' ) ).toBeTruthy();
            expect( Observer.translated( observer2.a, 'x' ) ).toBeTruthy();
        } );

        it( 'Should be changed after setting a new value', () => {
            const observer = Observer.create( {
                x : 1,
                y : 2,
                obj : {
                }
            } );

            observer.x = 100;
            observer.obj = {
                m : 'm'
            };
            observer.sub = {
                n : 'n'
            };
            observer.y = {
                a : 'a'
            };

            observer.obj.a = 'a';

            expect( observer.x ).toEqual( 100 );
            expect( Observer.translated( observer, 'x' ) ).toBeTruthy();

            expect( observer.obj.m ).toEqual( 'm' );
            expect( Observer.translated( observer.obj, 'm' ) ).toBeTruthy();

            expect( observer.obj.a ).toEqual( 'a' );
            expect( Observer.translated( observer.obj, 'a' ) ).toBeFalsy();

            expect( observer.y.a ).toEqual( 'a' );
            expect( Observer.translated( observer.y, 'a' ) ).toBeTruthy();

            expect( observer.sub.n ).toEqual( 'n' );
            expect( Observer.translated( observer.obj, 'n' ) ).toBeFalsy();
        } );

        it( 'using an observer as a part of another observer', () => {
            const observer = Observer.create( { x : 1 } );
            const observer2 = Observer.create( { observer } );

            expect( observer2.observer.x ).toEqual( 1 );
            expect( Observer.translated( observer2.observer, 'x' ) ).toBeTruthy();
        } );

        it( 'translate array', () =>{
            const observer = Observer.create( [ 1, 2 ] );
            expect( observer ).toEqual( [ 1, 2 ] );

            observer[ 0 ] = 0;
            expect( observer ).toEqual( [ 0, 2 ] );
        } );
    } );

    describe( 'Inheritance', () => {
        it( 'Should inherit data', () => {
            const parent = Observer.create( {
                y : 'y',
                z : 'z',
                a : 'a'
            } );

            const observer = Observer.create( {
                x : 1,
                y : 2,
                z : 3,
                obj : {
                    m : 1,
                    n : 2
                }
            }, parent );

            const sub = Observer.create( {
                x : 2
            }, observer );

            expect( sub.x ).toEqual( 2 );
            expect( sub.y ).toEqual( 2 );
            expect( sub.obj.n ).toEqual( 2 );
            expect( sub.z ).toEqual( 3 );
            expect( sub.a ).toEqual( 'a' );
        } );
    } );
} );
