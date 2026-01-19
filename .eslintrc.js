module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	env: {
		node: true,
		es6: true,
		jest: true,
	},
	rules: {
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
		'no-console': 'off',
		'semi': ['error', 'always'],
		'quotes': ['error', 'single', { avoidEscape: true }],
		'comma-dangle': ['error', 'always-multiline'],
	},
	ignorePatterns: ['dist/', 'node_modules/', '*.js', 'gulpfile.js'],
};
