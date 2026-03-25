/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        marcellus: ['Marcellus', 'serif'],
      },
      colors: {
        // Core Design Tokens
        papyrus: {
          DEFAULT: '#F4F1EA',
          dark: '#DCD5C4',
        },
        ink: '#2C2721',
        rubric: '#8B3A3A',
        roller: '#8C7A6B',
        // Imperial Tokens
        tyrian: '#2D0B23',
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97A',
        },
        obsidian: '#1A1208'
      },

      letterSpacing: {
        'imperial-wide': '4px',
        'imperial': '3px',
        'imperial-sub': '2px',
      },
      borderWidth: {
        'scroll': '16px',
      },
      boxShadow: {
        'scroll-inner': 'inset 0 0 100px rgba(0,0,0,0.1)',
        'scroll-outer': '0 0 100px rgba(0,0,0,0.8)',
      }
    },
  },
  plugins: [],
}
