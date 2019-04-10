module.exports = {
	plugins: [
		'import',
		'react'
	],
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:import/errors',
		'plugin:import/warnings'
	],
	env: {
		browser: true,
		commonjs: true,
		node: true,
		es6: true,
	},
	parser: 'babel-eslint',
	parserOptions: {
		ecmaVersion: '2018',
		sourceType: 'module',
		ecmaFeatures: {
			impliedStrict: true,
			jsx: true,
		},
	},
	rules: {
		'brace-style': ['error', 'stroustrup', { allowSingleLine: true }],
		camelcase: ["error", { allow: ['^UNSAFE_'] }],
		'capitalized-comments': [
			'error',
			'always',
			{
				line: {
					ignorePattern: '.',
					ignoreConsecutiveComments: true,
				},
				block: {
					ignoreInlineComments: true,
					ignorePattern: 'ignored',
				},
			},
		],
		curly: ["error", "multi-line", "consistent"],
		indent: [
			'error',
			'tab',
			{
				SwitchCase: 1, // indent 'case' statements 1-tab
				MemberExpression: 'off' // eg: .then(...)
			}
		],
		'linebreak-style': ['error', 'unix'],
		'no-alert': 'error',
		'no-caller': 'error',
		'no-console': 0,
		'no-invalid-this': 'error',
		'no-param-reassign': 'error',
		'no-shadow': 'error',
		'no-use-before-define': ['error', { functions: false, classes: true }],
		'no-useless-return': 'error',
		'no-with': 'error',
		quotes: [
			'error',
			'single',
			{ allowTemplateLiterals: true, avoidEscape: true },
		],
		semi: ['error', 'never'],
		strict: ['error', 'global'],
		'vars-on-top': 'warn',
	},
	overrides: [
		{
			files: ['.eslintrc.js'],
			excludedFiles: [],
			rules: {
				'comma-dangle': ['error', 'never'],
			},
		},
	],
}
