/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // add #F7201C as primary
    extend: {
      colors: {
        primary: {
          DEFAULT: "#F7201C",
          dark: "#F7201C",
        },
      },
    },
  },
  plugins: [],
}

