/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"], //
  darkMode: "class", // Aktiverar Dark Mode
  theme: {
    extend: {
      colors: {
        red1: "rgb(215, 0, 0)",
        red2: "rgb(255, 0, 0)",
        red3: "rgb(175, 0, 0)",
        red4: "rgb(135, 0, 0)",
        red5: "rgb(95, 0, 0)",
        red6: "rgb(55, 0, 0)",
        grey1: "rgb(210, 210, 210)",
        grey2: "rgb(160, 160, 160)",
        grey3: "rgb(120, 120, 120)",
        grey4: "rgb(80, 80, 80)",
        black1: "rgb(0, 0, 0)",
        white1: "rgb(255, 255, 255)",
        mainColor:"rgb(34, 46, 80)", 
        mainColorHover:"rgb(57, 77, 134)", 
        h2Color:"rgb(34, 46, 80)",
      },
      fontFamily: {
        digital: ['"Open Sans"', "sans-serif"],
        print: ['"Whitney"', "sans-serif"],
        body: ['"Mercury"', "serif"],
        office: ['"Arial"', "sans-serif"],
        longtext: ['"Georgia"', "serif"],
      },
    },
  },
  plugins: [],
};
