// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'import/first': 'off',
      'vue/attributes-order': 'off',
      'vue/html-self-closing': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  }
)
