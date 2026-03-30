/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        atlas: {
          bg: '#f5f5f5',
          surface: '#ffffff',
          tertiary: '#f5f5f5',
          border: '#eeeeee',
          accent: '#1a1a1a',
          blue: '#1a1a1a',
          green: '#8bc34a',
          'green-light': '#f0f7e6',
          'green-dark': '#5a8a2a',
          gold: '#1a1a1a',
          muted: '#999999',
          success: '#5a8a2a',
          warning: '#e6a817',
          danger: '#d44638',
          text: '#1a1a1a',
          sub: '#555555',
          soft: '#555555',
          'accent-hover': '#333333',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        btn: '14px',
        input: '12px',
        pill: '20px',
      },
    },
  },
  plugins: [],
};
