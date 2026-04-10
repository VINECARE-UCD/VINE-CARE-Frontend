/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark:   "#111611",
        green:  "#A4CF9C",
        forest: "#4B6646",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        sans:  ["'DM Sans'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
