/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#E7D1B0',
        'dark-bg': '#000000',
        'panel-bg': '#111111',
        border: '#222222',
        'text-muted': '#888888',
      },
    },
  },
  plugins: [],
}
