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
    } );

    it( 'Should store add setters in to setters map after setting new values', () => {
        const observer = Observer.create( {} );
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

        /*
        expect( setters.get( getSetter( o, 'm' ) ) ).toEqual( [
            { observer : observer2, path : 'a.o.m' },
            { observer : observer2, path : 'b.o.m' }
        ] );
        */

    } );
} );
