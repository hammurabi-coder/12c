import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

export default [
  // Global JS rules
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn'
    }
  },
  // Svelte specific rules
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      svelte: sveltePlugin
    },
    rules: {
      ...sveltePlugin.configs.recommended.rules
    }
  },
  // Ignore patterns
  {
    ignores: ['.svelte-kit/', 'docs/', 'suetonius_texts/', 'tools/']
  }
];
