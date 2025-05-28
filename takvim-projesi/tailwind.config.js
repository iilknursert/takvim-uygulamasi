/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  extend: {
    colors: {
      tema: {
        DEFAULT: "rgb(var(--tema-rengi) / <alpha-value>)",
        acik: "rgb(var(--tema-rengi-acik) / <alpha-value>)",
      }
    },
  },
  plugins: [],
}


