/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        atlas: {
          bg: '#FAF7F2',
          surface: '#F0EBE1',
          tertiary: '#E8DFD0',
          border: '#C4B9A8',
          accent: '#8C7355',
          'accent-hover': '#B39370',
          blue: '#8C7355',
          green: '#8C7355',
          'green-light': '#F0EBE1',
          'green-dark': '#6B6358',
          gold: '#8C7355',
          muted: '#6B6358',
          success: '#6B7F5B',
          warning: '#B39370',
          danger: '#9B5B4F',
          text: '#0D0D0B',
          sub: '#6B6358',
          soft: '#C4B9A8',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '2px',
        btn: '1px',
        input: '1px',
        pill: '100px',
      },
    },
  },
  plugins: [],
};
