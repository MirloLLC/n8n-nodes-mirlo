module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['eslint-plugin-n8n-nodes-base'],
	extends: ['plugin:n8n-nodes-base/community'],
	ignorePatterns: ['dist/**/*', 'node_modules/**/*'],
};
