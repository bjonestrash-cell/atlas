/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        atlas: {
          bg: '#eef2ee',
          surface: '#dde8e0',
          tertiary: '#ccdad0',
          border: '#b0c8bc',
          accent: '#1a3d32',
          'accent-hover': '#1e5c8a',
          blue: '#1e5c8a',
          soft: '#4a8c7a',
          gold: '#c8a84b',
          muted: '#527a6e',
          success: '#2d6e4e',
          warning: '#c8a84b',
          danger: '#8c3a30',
          text: '#0e1f1a',
          sub: '#2a4a3e',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
