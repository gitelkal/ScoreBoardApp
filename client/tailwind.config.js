/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Gör att Tailwind kan använda klasser i HTML och TypeScript
  ],
  darkMode: "class", // Aktiverar Dark Mode
  theme: {
    extend: {},
  },
  plugins: [],
};
