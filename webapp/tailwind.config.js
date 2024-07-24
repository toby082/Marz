
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'product-card' : 'rgba(212, 212, 212, 1)',
      },
    },
  },
  plugins: [],
}