import Observer from '../src/index';
import { objects, setters } from '../src/maps';

describe( 'Objects', () => {
    it( 'Should store each object into the objects map', () => {
        const obj1 = {};
        const obj2 = { obj1 };
        const observer = Observer.create( { obj2, arr : [ obj1, obj2 ] } );
        expect( objects.has( observer ) ).toBeTruthy();
        expect( objects.has( obj1 ) ).toBeTruthy();
        expect( objects.has( obj2 ) ).toBeTruthy();

        expect( objects.get( observer ) ).toEqual( [ { observer, path : undefined } ] );
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
        const observer = Observer.create( {
            x : 1,
            obj : {
                y : 1
            }
        } );
        expect( objects.has( observer ) ).toBeTruthy();
        expect( objects.has( observer.obj ) ).toBeTruthy();

        Observer.delete( observer, 'obj' );
    } );

} );
