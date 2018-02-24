import Observer from '../src/index';
import { objects } from '../src/maps';

describe( '', () => {
    it( '', () => {
        const obj = {
            x : {
                y : 1
            }
        };
        const observer = Observer.create( {
            a : obj,
            b : obj
        } );

        observer.a.x;
    } );
} );
