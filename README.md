# Observer

To watch the changes of an `Object`, supporting using expressions and computed function.


<!-- vim-markdown-toc GFM -->

* [Start](#start)
* [Usage](#usage)
    * [Example](#example)
    * [Caveat](#caveat)
    * [API](#api)
        * [Observer.create](#observercreate)
        * [Observer.destroy](#observerdestroy)
        * [Observer.set](#observerset)
        * [Observer.delete](#observerdelete)
        * [Observer.watch](#observerwatch)
        * [Observer.unwatch](#observerunwatch)
        * [Observer.is](#observeris)
        * [Observer.translated](#observertranslated)

<!-- vim-markdown-toc -->

## Start

To install the package with `npm`.

```js
$ npm i @lvchengbin/observer
```

Then, you can use it in nodejs code:

```js
const Observer = require( '@lvchengbin/observer' );
```

Or to use it as an ES6 module:

```js
import Observer from '@lvchengbin/observer';
```

## Usage

### Example

```js
import Observer from '@lvchengbin/observer';
const object = { x : 1 };

// to translate an Object with Observer.create;
const observer = Observer.create( object );

// to watch the changes of an expression

Observer.watch( observer, 'x + 1', ( value, oldvalue ) => {
    // value is the current value of expression "x + 1"
    // oldvalue is the old value of expression "x + 1" before being changed
} );

observer.x = 2;

// to inherite from another observer.

const sub = Observer.create( {
    obj : {
        y : 2
    }
}, observer );

console.log( sub.x ); // output 2, inherited from object and the "x" has been changed to 2

Observer.watch( sub, 'obj.y + x', ( value, oldvalue, expression, observer ) => {
    // to do something.
} );

// to watch a complex expression

const sub2 = Observer.create( {
    list : [ 'a', 'b', 'c' ]
}, sub );

Observer.watch( sub2, 'x == 2 ? list.join( "." ) : obj.y', ( value, oldvalue ) => {
    // to do something.
} );

// to watch the changes of the return value of a function
Observer.watch( sub2, () => {
    return sub2.list.length + sub2.obj.y;
}, () => {
    // to do something
} )
```

### Caveat

 - Setting a new property to an object with "." or "[]" cannot be watched by observer, so if you want to set a new property, please use [Observer.set](#observerset).

 - Deleting a property from an object cannot be watched by observer, so if you want to delete a property of an object, please use [Observer.delete](#observerdelete).

 - Setting a value with "[n]" to an array cannot be watched by observer, so if you want to set a new property, please use `[].$set` or [Observer.set](#observerset).
    
    ```js
    const observer = Observer.create( { arr : [ 'a', 'b', 'c' ] } );
    observer.arr.$set( 0, 'A' );
    Observer.set( observer.arr, 1, 'B' );
    ```

 - Mutating an array by changing is length cannot be watch by observer, if you want to change the length of an array, please use [Observer.set](#observerset), or `[].$length`

    ```js
    const observer = Observer.create( { arr : [ 'a', 'b', 'c' ] } );
    observer.arr.$length( 10 );
    Observer.set( observer.arr, 'length', 20 );
    ```

 - About the methods of arrays in `Array.prototype`, the observer supports `Array.prototype.push`, `Array.prototype.pop`, `Array.prototype.shift`, `Array.prototype.unshift`, `Array.prototype.splice`, `Array.prototype.sort`, `Array.prototype.reverse` and `Array.prototype.fill`, if the client also support them. Other methods, not in the list, cannot be used to arrays because the observer cannot watch the changes caused by the method.

    ```js
    const observer = Observer.create( { arr : [ 'a', 'b', 'c' ] } );
    observer.arr.push( 'd' );
    observer.arr.reverse();
    observer.arr.sort();
    ```

 - Even though we can use an array for creating an observer, but you cannot watch it like: `[0] + [1]`, if you want to watch the changes of an observer like this, please try using a `Function` as the expression.

    ```js
    const observer = Observer.create( [ 'a', 'b', 'c' ] );
    Observer.watch( observer, ob => ob[ 0 ] + ob[ 1 ], value => {
        console.log( value );
    } );
    ```

 - For avoiding to execute same handler multiple times while changing one value, in the observer, one global `EventCenter` instance is being used for all the observers created by `Observer.create`. Because each object can be used in multiple observers, and each expression may depend multiple objects and values, so there might be some problems while unwatch an expression or function if the handler is aslo being used for other expressions or functions. So, it is better not to use one handler for multiple expressions or functions multiple times.
### API

#### Observer.create

To translate an Object to using `get` and `set`.

```js
Observer.create( obj, proto );
```

 - **obj** 
    The object you want to watch

 - **proto**
    Another observer which would be bound to the prototype of current observer.

```js
const observer = Observer.create( { x : 1, y : 1 } );
const sub = Observer.create( { x : 2, z : 3 }, observer );

console.log( sub.x ); // output 2
console.log( sub.y ); // output 1
console.log( sub.z ); // output 3
```
#### Observer.destroy
To destroy an observer. This method will not do any changes for the observer, but will remove some data and watched listener of the observer, so to call this method if it will not be used any more would relaease the memory and get better performance.

```js
const observer = Observer.create( {} );
Observer.destroy( observer );
```

#### Observer.set
To set a new property to an object in an observer. If the `object` is an `Array` and the `key` is an `Integer`, the value would be set as the item of the array.

```js
Observer.set( obj, key, value );
```
 - **obj**
    The object which would be change

 - **key**
    The property's name

 - **value**
    The property's value

```js
const obj = {};

const observer = Observer.create( { obj } );
Observer.set( obj, 'key', 'value' );

Observer.watch( observer, 'obj.key', value => {
    // to do something.
} );
```
#### Observer.delete
To delete a property of an object in an observer

```js
Observer.delete( obj, key );
```

 - **obj** `Object`
    The object which is going to be changed.

 - **key** `String`
    The property which is going to be deleted.

```js
const observer = Observer.create( { x : 1 } );
Observer.delete( observer, 'x' );
```
#### Observer.watch
To watch the changes of an expression or the return value of a function.

```js
Observer.watch( observer, expression, handler );
```

 - **observer**
    The observer that you want to watch.

 - **expression** `String|Function`
    The exppression that you want to watch. It also can be a `Function` which returns a value or returns a promise instance.

 - **handler** `Function`
    The hander which would execute while the value of expression changed.

```js
const observer = Observer.create( { x : 1, y : 1 } );
Observer.watch( observer, 'x + y', ( value, oldvalue ) => {
    // execute whild the value of the expression "x + y" changed.
} );

Observer.watch( observer, ob => ob.x + ob.y, ( value, oldvalue ) => {
    // execute while the return value of the function "ob => ob.x + ob.y" changed.
} );

Observer.watch( observer, ob => Promise.resolve( ob.x + ob.y ), ( value, oldvalue ) => {
    // execute while the value of the promise changed.
} );
```

#### Observer.unwatch
To stop watching an expression or a function.

```js
Observer.unwatch( observer, expression, handler );
```

```js
const observer = Observer.create( { x : 1 } );
const handler = value => {
    console.log( value );
};

Observer.watch( observer, 'x', handler );
Observer.unwatch( observer, 'x', handler );
```

```js
const observer = Observer.create( { x : 1 } );

const computed = ob => ob.x;

const handler = value => {
    console.log( value );
};

Observer.watch( observer, computed, handler );
Observer.unwatch( observer, computed, handler );
```

#### Observer.is
To check if an object was translated by `Observer`.

```js
Observer.is( {} ); // returns false
Observer.is( Observer.create( {} ) ); // returns true
```

#### Observer.translated
To check if a property of an object was translated by `Observer`;

```js
const obj = { x : 1 };

Observer.translated( obj, 'x' ); // returns false;

Observer.create( { obj } );

Observer.translated( obj, 'x' ); // returns true;
```
