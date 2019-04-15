import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import svgr from '@svgr/rollup'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import { terser } from 'rollup-plugin-terser'

import pkg from './package.json'

const globals = {
	react: 'React',
	'react-router-dom': 'ReactRouterDOM',
	'prop-types': 'PropTypes'
}

const basePlugins = [
	// List external libraries that should not be bundled
	external(),
	postcss({
		modules: true
	}),
	url(),
	svgr(),
	babel({
		exclude: 'node_modules/**',
		plugins: ['external-helpers']
	}),

	// Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
	commonjs(),

	// Allow node_modules resolution, so you can use 'external' to control
	// which external modules to include in the bundle
	// https://github.com/rollup/rollup-plugin-node-resolve#usage
	resolve()

	// Output a file listing bundle sizes for easy review
	// sizeSnapshot(),

	// Enable minification
	// terser()
]


export default [
	{
		input: 'src/index.js',
		output: {
			file: `cjs/index.js`,
			format: 'cjs',
		},
		plugins: basePlugins
	},

	{
		input: 'src/index.js',
		output: {
			file: `esm/index.js`,
			format: 'esm',
			esModule: true,
		},
		plugins: [ sizeSnapshot() ].concat(basePlugins)
	},

	{
		input: 'src/index.js',
		output: {
			file: `umd/${pkg.name}.js`,
			format: 'umd',
			name: 'ReactRouterPause',
			globals,
			external: Object.keys(globals),
			esModule: false,
			sourcemap: true,
		},
		plugins: basePlugins
	},

	{
		input: 'src/index.js',
		output: {
			file: `umd/${pkg.name}.min.js`,
			format: 'umd',
			name: 'ReactRouterPause',
			globals,
			external: Object.keys(globals),
			esModule: false,
			sourcemap: true,
		},
		plugins: [ terser(), sizeSnapshot() ].concat(basePlugins)
	}
]
