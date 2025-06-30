/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#F5F5DC',
        primary: '#FFD124',
        gray: '#808080',
      },
    },
  },
  plugins: [],
};
