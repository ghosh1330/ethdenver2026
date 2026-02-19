/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        purple: { 50: '#f5f3ff', 500: '#8b5cf6', 600: '#7c3aed' }
      }
    }
  },
  plugins: [],
}
