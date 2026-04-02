/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        atlas: {
          bg: '#FAF7F2',
          surface: '#F2EDE5',
          tertiary: '#EDE7DC',
          border: '#D4CAB8',
          accent: '#8B6F47',
          'accent-hover': '#A08455',
          blue: '#8B6F47',
          green: '#8B6F47',
          'green-light': '#F2EDE5',
          'green-dark': '#7A7060',
          gold: '#8B6F47',
          muted: '#7A7060',
          success: '#6B7F5B',
          warning: '#A08455',
          danger: '#9B5B4F',
          text: '#1C1A17',
          sub: '#3D3930',
          soft: '#D4CAB8',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
