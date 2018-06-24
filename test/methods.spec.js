import sleep from '@lvchengbin/sleep';
import Promise from '@lvchengbin/promise';
import Observer from '../src/index';

describe( 'Observer methods', () => {

    afterAll( () => {
        const observer = Observer.create( {
            obj : {
                obj : {
                    obj : {
                        x : 1, 
                        y : 2,
                        z : 3
                    }
                }
            }
        } );

        for( let i = 0; i < 100000; i += 1 ) {
            Observer.watch( observer, 'obj.obj.obj.x + obj.obj.obj.y + obj.obj.obj.z', () => {} );
        }
        Observer.delete( observer, 'obj' );
        console.log( `Used Memory: ${window.performance.memory.usedJSHeapSize / 1024 / 1024}M.` );
    } );

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

    describe( 'Observer.set', () => {
            const observer = Observer.create( {
                key : 'value',
                obj : {}
            } );

        it( 'to set a new property', () => {
            Observer.set( observer, 'key', 'new value' );
            expect( observer.key ).toEqual( 'new value' );
        } );

        it( 'the new value should have been translated', () => {
            Observer.set( observer, 'key1', 'value1' );
            expect( observer.key1 ).toEqual( 'value1' );
            expect( Observer.translated( observer, 'key1' ) ).toBeTruthy();

            Observer.set( observer.obj, 'x', 1 );
            expect( observer.obj.x ).toEqual( 1 );
            expect( Observer.translated( observer.obj, 'x' ) ).toBeTruthy();
            
        } );

        it( 'to set a new property with specifying traverseTranslate to false', () => {
            Observer.set( observer, '$this', {
                obj : { x : 1 }
            } );
            expect( observer.$this ).toEqual( { obj : { x : 1 } } );
            expect( Observer.translated( observer.$this.obj ) ).toBeFalsy();
        } );

        it( 'to set a new property with mute is true', () => {
            let i = 0;
            const observer = Observer.create( {} );
            Observer.watch( observer, 'x', () => i++ );
            Observer.set( observer, 'x', 1, true, true );
            expect( i ).toEqual( 0 );
        } );

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

        it( 'should not work if an object was delete from an Observer', () => {
            const obj = { x : 1 };
            const observer = Observer.create( { obj } );

            let i = 0;

            Observer.watch( observer, 'obj.x', () => {
                i++;
            } );

            Observer.delete( observer, 'obj' );

            obj.x = 2;

            expect( i ).toEqual( 1 );
        } );


        it( 'should not work if an object was delete from an Observer', done => {
            const obj = { x : 1 };
            const observer = Observer.create( { obj } );

            Observer.watch( observer, 'obj.x', () => {
                if( observer.obj.z ) {
                    done();
                }
            } );

            observer.obj.x = 2;
            observer.obj = { z : 1, x : 1 };
            observer.obj.x = 3;
        } );

        it( 'to watch changes of a function', done => {
            const observer = Observer.create( { 
                x : 1,
                y : 2
            } );

            Observer.watch( observer, ob => ob.x + ob.y, ( value, oldvalue ) => {
                expect( value ).toEqual( 12 );
                expect( oldvalue ).toEqual( 3 );
                done();
            } );

            observer.x = 10;
        } );

        it( 'to watch a function which returns a Promise', done => {
            const observer = Observer.create( { 
                x : 1,
                y : 2
            } );

            const computed =  ob => {
                return new Promise( resolve => {
                    const y = ob.y;
                    sleep( 10 ).then( () => resolve( y ) );
                } );
            };

            Observer.watch( observer, computed, ( value, oldvalue ) => {
                expect( value ).toEqual( 100 );
                expect( oldvalue ).toEqual( 2 );
                done();
            } );

            observer.y = 100;
            
        } );

        it( 'to watch length of string', done => {
            const observer = Observer.create( { str : 'abc' } );
            Observer.watch( observer, 'str.length', ( value, oldvalue ) => {
                expect( value ).toEqual( 4 );
                expect( oldvalue ).toEqual( 3 );
                done();
            } );

            observer.str = '1234';
        } );

        it( 'watching after replace', done => {
            const observer = Observer.create( { x : 1, y : 2 } );
            Observer.watch( observer, 'm + n', ( value, oldvalue ) => {
                expect( value ).toEqual( 3 );
                expect( oldvalue ).toEqual( null );
                done();
            } );

            Observer.replace( observer, {
                m : 1,
                n : 2
            } );

        } );

        it( 'watching same expression multiple times', done => {
            const observer = Observer.create( { x : 1, y : 2 } );
            Observer.watch( observer, 'x', ( value, oldvalue ) => {
                expect( value ).toEqual( 2 );
                expect( oldvalue ).toEqual( 1 );
            } );

            Observer.watch( observer, 'x', ( value, oldvalue ) => {
                expect( value ).toEqual( 2 );
                expect( oldvalue ).toEqual( 1 );
                done();
            } );
            observer.x = 2;
        } );
    } );

    describe( 'Watching with inherited data', () => {

        it( 'basic supporting', done => {
            const ob1 = Observer.create( { x : 1 } );
            const ob2 = Observer.create( { y : 2 }, ob1 );

            Observer.watch( ob2, 'x + y', ( value, oldvalue ) => {
                expect( value ).toEqual( 4 );
                expect( oldvalue ).toEqual( 3 );
                done();
            } );

            ob1.x = 2;
        } );

        it( 'overwriting data in sub observer', done => {
            const ob1 = Observer.create( { x : 1 } );
            const ob2 = Observer.create( { y : 2 }, ob1 );

            Observer.watch( ob2, 'x + y', ( value, oldvalue ) => {
                expect( value ).toEqual( 4 );
                expect( oldvalue ).toEqual( 3 );
                done();
            } );

            Observer.set( ob2, 'x', 2 );
        } );

        it( 'delete value from super observer', done => {

            const ob1 = Observer.create( { x : 1 } );
            const ob2 = Observer.create( { y : 2 }, ob1 );

            Observer.watch( ob2, 'x + y', ( value, oldvalue ) => {
                expect( value ).toEqual( null );
                expect( oldvalue ).toEqual( 3 );
                done();
            } );

            Observer.delete( ob1, 'x' );
        } );

        it( 'delete value from sub observer', done => {

            const ob1 = Observer.create( { x : 1 } );
            const ob2 = Observer.create( { y : 2, x : 2 }, ob1 );

            Observer.watch( ob2, 'x + y', ( value, oldvalue ) => {
                expect( value ).toEqual( 3 );
                expect( oldvalue ).toEqual( 4 );
                done();
            } );

            Observer.delete( ob2, 'x' );
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

        it( 'unwatch a function listener', () => {
            let i = 0;

            const observer = Observer.create( { 
                x : 1,
                y : 2
            } );

            const computed = ob => ob.x + ob.y;
            const handler = () => i++;

            Observer.watch( observer, computed, handler );
            Observer.unwatch( observer, computed, handler );

            observer.x = 10;

            expect( i ).toEqual( 0 );
        } );
    } );

    describe( 'Observer.destroy', () => {
        it( 'should unwatch all watching listeners after calling destroy', () => {

            let i = 0;

            const observer = Observer.create( {
                x : 1,
                y : 1
            } )

            const handler = () => i++;

            Observer.watch( observer, 'x', handler );
            Observer.watch( observer, ob => ob.y, handler );
            Observer.watch( observer, 'z', handler );

            Observer.destroy( observer );

            observer.x = 2;
            observer.y = 2;
            Observer.set( observer, 'x', 3 );

            expect( i ).toEqual( 0 );
        } );
    } );

    describe( 'Observer.replace', () => {
        it( 'should have replaced all data of the observer', () => {
            const observer = Observer.create( {
                x : 1,
                y : 2
            } );

            Observer.replace( observer, {
                x : 10,
                n : 100
            } );

            expect( observer ).toEqual( {
                x : 10,
                n : 100
            } );
        } );
    } );

    describe( 'Observer.calc', () => {
        
        it( 'simple expression', () => {
            const observer = Observer.create( {
                x : 1,
                y : 2
            } );
            expect( Observer.calc( observer, 'x + y ' ) ).toEqual( 3 );
        } );

        it( 'expression with default value', () => {
            const observer = Observer.create( {} );
            expect( Observer.calc( observer, 'x + y', 100 ) ).toEqual( 100 );
        } );
    } );
} );

