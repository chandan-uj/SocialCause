/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: { 50: '#eef7f2', 100: '#d9ede1', 500: '#26805b', 600: '#176b4d', 700: '#14563f', 900: '#103d2e' },
        sand: '#f7f6f1'
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 12px 36px rgba(28, 63, 47, .08)' }
    }
  },
  plugins: []
};
