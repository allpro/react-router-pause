import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import svgr from '@svgr/rollup'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import { terser } from 'rollup-plugin-terser'
// import replace from 'rollup-plugin-replace'

import pkg from './package.json'


const globals = {
	react: 'React',
	'react-router-dom': 'ReactRouterDOM',
	'prop-types': 'PropTypes'
}


export default {
	input: 'src/index.js',
	output: [
		{
			file: `dist/cjs/${pkg.name}.js`,
			format: 'cjs',
			plugins: [
				sizeSnapshot()
			]
		},
		{
			file: `dist/cjs/${pkg.name}.min.js`,
			format: 'cjs',
			sourcemap: true,
			plugins: [
				terser(),
				sizeSnapshot()
			]

		},

		{
			file: `dist/esm/${pkg.name}.js`,
			format: 'esm',
			plugins: [
				sizeSnapshot()
			]
		},

		{
			file: `dist/umd/${pkg.name}.js`,
			format: 'umd',
			name: 'ReactRouterPause',
			globals,
			external: Object.keys(globals),
			sourcemap: true,
			plugins: [
				sizeSnapshot()
			]

		},
		{
			file: `dist/umd/${pkg.name}.min.js`,
			format: 'umd',
			name: 'ReactRouterPause',
			globals,
			external: Object.keys(globals),
			sourcemap: true,
			plugins: [
				terser(),
				sizeSnapshot()
			]
		}
	],
	plugins: [
		external(),
		postcss({
			modules: true,
			minimize: true
		}),
		url(),
		svgr(),
		babel({
			exclude: 'node_modules/**',
			plugins: [ 'external-helpers' ]
		}),
		resolve(),
		commonjs()
	]
}
