import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginTs from '@typescript-eslint/eslint-plugin'
import parserVue from 'vue-eslint-parser'
import parserTs from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.{ts,tsx,vue}'],
    ignores: [
        'tests/**/*',
        'vitest.setup.ts',
        'tests/urlPolyfill.ts',
        'scan-i18n.js'
    ],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: parserTs,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: ['./tsconfig.json', './tsconfig.src.json'],
        extraFileExtensions: ['.vue'],
        globals: {
          window: 'readonly',
          document: 'readonly', 
          localStorage: 'readonly',
          navigator: 'readonly',
          setTimeout: 'readonly',
          clearTimeout: 'readonly',
          console: 'readonly',
          NodeJS: 'readonly',
          require: 'readonly',
          exports: 'readonly'
        }
      },
    },
    plugins: {
      '@typescript-eslint': pluginTs,
      vue: pluginVue,
    },
    rules: {
      // Strict TypeScript rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      
      // Vue rules
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      
      // Disable generic rules in favor of TypeScript-specific ones
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    }
  },
  {
    files: ['vitest.setup.ts', 'scan-i18n.js', 'scan-i18n.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        require: 'readonly',
        exports: 'readonly',
        globalThis: 'readonly'
      }
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly'
      }
    }
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly'
      }
    }
  },
  {
    ignores: ['dist', 'node_modules', '*.config.ts', '*.config.js', '.tsbuildinfo', '.eslintcache']
  }
]