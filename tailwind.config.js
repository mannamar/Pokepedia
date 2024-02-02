/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/**/*.html", "./dist/scripts/app.js"],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['"Nunito"']
      }
    },
  },
  plugins: [],
}