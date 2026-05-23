module.exports = {
	root: true,
	env: {
		es6: true,
		node: true,
	},
	extends: ['eslint:recommended'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint'],
	rules: {
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': 'error',
		'no-console': 'warn',
		'prefer-const': 'error',
		'no-var': 'error',
	},
	ignorePatterns: ['node_modules/**', 'dist/**'],
};
