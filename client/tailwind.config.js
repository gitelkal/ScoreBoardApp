/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        red1: "var(--red1)",
        red2: "var(--red2)",
        red3: "var(--red3)",
        red4: "var(--red4)",
        red5: "var(--red5)",
        red6: "var(--red6)",
        grey1: "var(--grey1)",
        grey2: "var(--grey2)",
        grey3: "var(--grey3)",
        grey4: "var(--grey4)",
        black1: "var(--black1)",
        white1: "var(--white1)",
      },
    },
  },
  plugins: [],
};
