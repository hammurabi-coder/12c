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
        papyrus: {
          DEFAULT: '#F4F1EA',
          dark: '#DCD5C4',
        },
        ink: '#2C2721',
        rubric: '#8B3A3A',
        roller: '#8C7A6B',
      }
    },
  },
  plugins: [],
}
