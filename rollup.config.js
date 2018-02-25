import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default [ {
    input : 'src/index.js',
    plugins : [
        resolve( {
            module : true,
            jsnext : true
        } )
    ],
    output : [
        { file : 'dist/observer.cjs.js', format : 'cjs' },
        { file : 'dist/observer.js', format : 'umd', name : 'Observer' }
    ]
}, {
    input : 'src/index.js',
    plugins : [
        resolve( {
            jsnext : true
        } ),
        babel()
    ],
    output : [
        { file : 'dist/observer.bc.js', format : 'umd', name : 'Observer' }
    ]
} ];
