import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['**/dist/**'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      'semi': ['error', 'never'],
      'quotes': ['error', 'single']
    }
  }
)