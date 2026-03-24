import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

export default [
  // Global JS rules
  {
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
        browser: true,
        node: true,
        es2017: true
      }
    },
    plugins: {
      svelte: sveltePlugin
    },
    rules: {
      ...sveltePlugin.configs.recommended.rules,
      'svelte/no-at-html-tags': 'off' // We use @html for the biography text
    }
  },
  // Ignore patterns
  {
    ignores: ['.svelte-kit/', 'docs/', 'suetonius_texts/', 'tools/']
  }
];
