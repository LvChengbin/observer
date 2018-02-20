import is from '@lvchengbin/is';
import Observer from '../src/index.js';

describe( 'Observer', () => {
    it( 'Should created an Observer instance with an Object', () => {
        const observer = new Observer( {} );
        expect( is.empty( observer ) ).toBeTruthy();
    } );

    it( 'Should create an Observer instance with an Array', () => {
        const observer = new Observer( [] );
        expect( is.empty( observer ) ).toBeTruthy();
    } );

    it( 'Should have same structure with the original object', () => {
        const observer = new Observer( {
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

    it( 'Should be changed after setting a new value', () => {
        const observer = new Observer( {
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

        observer.obj.a = 'a';

        expect( observer.x ).toEqual( 100 );
        expect( Observer.translated( observer, 'x' ) ).toBeTruthy();
        expect( observer.obj.m ).toEqual( 'm' );
        expect( Observer.translated( observer.obj, 'm' ) ).toBeTruthy();
        expect( observer.obj.a ).toEqual( 'a' );
        expect( Observer.translated( observer.obj, 'a' ) ).toBeFalsy();
        expect( observer.sub.n ).toEqual( 'n' );
        expect( Observer.translated( observer.obj, 'n' ) ).toBeFalsy();
    } );
} );

describe( 'Observer methods', () => {
    it( 'Observer.translated', () => {
        const observer = new Observer( {
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
        const observer = new Observer( {
            key : 'value',
            obj : {}
        } );

        Observer.set( observer, 'key1', 'value1' );
        expect( observer.key1 ).toEqual( 'value1' );
        Observer.set( observer.obj.x,  1 );
        expect( observer.obj.x ).toEqual( '1' );
    } );
} );

