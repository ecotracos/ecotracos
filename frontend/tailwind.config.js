/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          dark: '#11313a',
          primary: '#b3875e',
          secondary: '#ecc49a',
          accent: '#8c7f6a',
          light: '#dcccae',
        }
      }
    },
  },
  plugins: [],
}
