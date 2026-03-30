/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        atlas: {
          bg: '#e8eff5',
          surface: '#dce6ee',
          tertiary: '#cfdbe6',
          border: '#b8cad8',
          accent: '#2c5f8a',
          'accent-hover': '#3a7a5c',
          blue: '#2c5f8a',
          soft: '#3a7a5c',
          gold: '#c8a84b',
          muted: '#5a7a8e',
          success: '#3a7a5c',
          warning: '#c8a84b',
          danger: '#8c3a30',
          text: '#1a2a3a',
          sub: '#2e4a5e',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        heading: ['Barlow Condensed', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
