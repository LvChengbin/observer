import Observer from '../src/index';
import utils from '../src/utils';
import { objects, setters } from '../src/maps';

function getSetter( obj, key ) {
    return Object.getOwnPropertyDescriptor( obj, key ).set;
}

describe( 'Objects', () => {
    it( 'Should store each object into the objects map', () => {
        const obj1 = {};
        const obj2 = { obj1 };
        const observer = Observer.create( { obj2, arr : [ obj1, obj2 ] } );
        expect( objects.has( observer ) ).toBeTruthy();
        expect( objects.has( obj1 ) ).toBeTruthy();
        expect( objects.has( obj2 ) ).toBeTruthy();

        expect( objects.get( observer ) ).toEqual( [ { observer, path : '' } ] );
        expect( objects.get( obj1 ) ).toEqual( [ 
            { observer, path : 'obj2.obj1' },
            { observer, path : 'arr[0]' },
            { observer, path : 'arr[1].obj1' }
        ] );
        expect( objects.get( obj2 ) ).toEqual( [
            { observer, path : 'obj2' },
            { observer, path : 'arr[1]' }
        ] );
    } );

    it( 'Should add data into objects map after setting new values', () => {
        const obj = { o : 1 }
        const observer = Observer.create( { x : 1 } );
        observer.x = { obj };

        expect( objects.get( observer.x.obj ) ).toEqual( [
            { observer, path : 'x.obj' }      
        ] );

        Observer.set( observer.x, 'o', obj );

        expect( objects.get( observer.x.o ) ).toEqual( [
            { observer, path : 'x.obj' },
            { observer, path : 'x.o' }
        ] );

        Observer.set( observer, 'x', {
            m : {}
        } );

        expect( objects.get( observer.x ) ).toEqual( [
            { observer, path : 'x' }
        ] );

        expect( objects.get( observer.x.m ) ).toEqual( [
            { observer, path : 'x.m' }
        ] );
    } );

    it( 'Should delete data in objects map after overwriting an object by assigning a new value', () => {
        const obj = { o : {} }
        const observer = Observer.create( { obj } );

        observer.obj = {
            m : {}
        }

        expect( objects.get( observer.obj.m ) ).toEqual( [
            { observer, path : 'obj.m' }
        ] );

        expect( objects.get( obj.o ) ).toEqual( [] );
    } );

    it( 'Should delete data in objects map after overwrite on object by Observer.set', () => {
        const obj = { o : {} }
        const observer = Observer.create( { obj } );

        Observer.set( observer, 'obj', {
            m : {}
        } );

        expect( objects.get( observer.obj.m ) ).toEqual( [
            { observer, path : 'obj.m' }
        ] );

        expect( objects.get( obj.o ) ).toEqual( [] );
    } );

    it( 'Should be deleted after deleting properties from an object in an observer', () => {
        const o = {};
        const obj = { o };
        const observer = Observer.create( {
            x : 1,
            obj
        } );

        const observer2 = Observer.create( {
            a : obj,
            b : obj
        } );

        expect( objects.get( observer.obj ) ).toEqual( [ 
            { observer, path : 'obj' },
            { observer : observer2, path : 'a' },
            { observer : observer2, path : 'b' }
        ] );

        expect( objects.get( observer.obj.o ) ).toEqual( [
            { observer, path : 'obj.o' },
            { observer : observer2, path : 'a.o' },
            { observer : observer2, path : 'b.o' }
        ] );

        expect( objects.get( observer2.a ) ).toEqual( [ 
            { observer, path : 'obj' },
            { observer : observer2, path : 'a' },
            { observer : observer2, path : 'b' }
        ] );

        Observer.delete( observer, 'obj' );

        expect( objects.get( observer2.a ) ).toEqual( [
            { observer : observer2, path : 'a' },
            { observer : observer2, path : 'b' }
        ] );

        expect( objects.get( observer2.a.o ) ).toEqual( [
            { observer : observer2, path : 'a.o' },
            { observer : observer2, path : 'b.o' }
        ] );
    } );

} );

describe( 'Setters', () => {
    it( 'Each property of the objects in an observer should have a SETTER function', () => {
        const observer = Observer.create( { 
            x : 1,
            obj : {
                y : 'y'
            }
        } );

        let setter;

        setter = getSetter( observer, 'x' );
        expect( utils.isObserverSetter( setter ) ).toBeTruthy();

        setter = getSetter( observer.obj, 'y' );
        expect( utils.isObserverSetter( setter ) ).toBeTruthy();
    } );

    it( 'Should store each setter into the setters map', () => {
        const observer = Observer.create( { 
            x : 1,
            obj : {
                y : 'y'
            }
        } );

        let setter;

        setter = getSetter( observer, 'x' );
        expect( setters.get( setter ) ).toEqual( [
            { observer, path : 'x' }
        ] );

        setter = getSetter( observer.obj, 'y' );
        expect( setters.get( setter ) ).toEqual( [
            { observer, path : 'obj.y' } 
        ] );

        const observer2 = Observer.create( { observer } );

        expect( setters.get( getSetter( observer2.observer.obj, 'y' ) ) ).toEqual( [
            { observer, path : 'obj.y' },
            { observer : observer2, path : 'observer.obj.y' }
        ] );
    } );

    it( 'Should store add setters in to setters map after setting new values', () => {
        const observer = Observer.create( {} );
        Observer.set( observer, 'key', 'value' );
        expect( setters.get( getSetter( observer, 'key' ) ) ).toEqual( [
            { observer, path : 'key' }
        ] );

        const obj = {};

        observer.key = {
            m : 1,
            n : 2,
            obj
        };
        expect( setters.get( getSetter( observer.key, 'm' ) ) ).toEqual( [
            { observer, path : 'key.m' }
        ] );

        Observer.set( obj, 'sub', { x : 1 } );

        expect( setters.get( getSetter( obj, 'sub' ) ) ).toEqual( [
            { observer, path : 'key.obj.sub' }
        ] );

        expect( setters.get( getSetter( obj.sub, 'x' ) ) ).toEqual( [
            { observer, path : 'key.obj.sub.x' }
        ] );

        const o = {};
        const m = { n : 1 };
        const observer2 = Observer.create( { observer, o } );

        observer.key = {
            a : 1,
            b : obj
        };

        expect( setters.get( getSetter( observer2.observer.key, 'a' ) ) ).toEqual( [
            { observer, path : 'key.a' },
            { observer : observer2, path : 'observer.key.a' }
        ] );

        Observer.set( observer2, 'x', 1 );

        expect( setters.get( getSetter( observer2, 'x' ) ) ).toEqual( [
            { observer : observer2, path : 'x' }
        ] );

        Observer.set( o, 'o', 'o' );

        expect( setters.get( getSetter( o, 'o' ) ) ).toEqual( [
            { observer : observer2, path : 'o.o' },
        ] );

        Observer.set( observer2, 'm', m );
        expect( setters.get( getSetter( m, 'n' ) ) ).toEqual( [
            { observer : observer2, path : 'm.n' }
        ] );

    } );

    it( 'to set a new value with Observer.set after deleting the old value with Observer.delete', () => {
        const observer = Observer.create( {} );

        Observer.set( observer, 'x', {} );
        Observer.delete( observer, 'x' );
        Observer.set( observer, 'x', {} );

        expect( setters.get( getSetter( observer, 'x' ) ) ).toEqual( [
            { observer, path : 'x' }
        ] );
    } );

    it( 'Should remove all data storing in setters map after deleting a property of an object in an observer', () => {
        const m = {}
        const o = { m };
        const obj = { o };
        const observer = Observer.create( {
            x : 1,
            obj
        } );

        const observer2 = Observer.create( {
            a : obj,
            b : obj
        } );

        expect( setters.get( getSetter( observer, 'obj' ) ) ).toEqual( [ 
            { observer, path : 'obj' }
        ] );

        expect( setters.get( getSetter( observer.obj, 'o' ) ) ).toEqual( [
            { observer, path : 'obj.o' },
            { observer : observer2, path : 'a.o' },
            { observer : observer2, path : 'b.o' }
        ] );

        expect( setters.get( getSetter( observer2, 'a' ) ) ).toEqual( [ 
            { observer : observer2, path : 'a' }
        ] );

        expect( setters.get( getSetter( o, 'm' ) ) ).toEqual( [
            { observer, path : 'obj.o.m' },
            { observer : observer2, path : 'a.o.m' },
            { observer : observer2, path : 'b.o.m' }
        ] );

        Observer.delete( observer, 'obj' );

        expect( setters.get( getSetter( o, 'm' ) ) ).toEqual( [
            { observer : observer2, path : 'a.o.m' },
            { observer : observer2, path : 'b.o.m' }
        ] );

        Observer.delete( obj, 'o' );

        expect( setters.get( getSetter( o, 'm' ) ) ).toEqual( [] );

        Observer.set( obj, 'o', o );

        expect( setters.get( getSetter( o, 'm' ) ) ).toEqual( [
            { observer : observer2, path : 'a.o.m' },
            { observer : observer2, path : 'b.o.m' }
        ] );
    } );

    it( 'Should remove data in setters map after overwriting an object', () => {
        const obj = {
            x : 1
        };
        const observer = Observer.create( { obj } );

        expect( setters.get( getSetter( obj, 'x' ) ) ).toEqual( [
            { observer, path : 'obj.x' }
        ] );

        observer.obj = {};
        expect( setters.get( getSetter( obj, 'x' ) ) ).toEqual( [] );
    } );

    it( 'Should remove data in setters map after overwriting an object with Observer.set', () => {
        const obj = {
            x : 1
        };
        const observer = Observer.create( { obj } );

        expect( setters.get( getSetter( obj, 'x' ) ) ).toEqual( [
            { observer, path : 'obj.x' }
        ] );

        Observer.set( observer, 'obj', {} );
        expect( setters.get( getSetter( obj, 'x' ) ) ).toEqual( [] );
    } );
} );
