/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef2f8",
          100: "#d5dfee",
          200: "#aebfdd",
          300: "#7f9bc9",
          400: "#5378b0",
          500: "#385c93",
          600: "#294876",
          700: "#1f3760",
          800: "#162748",
          900: "#0c1830",
        },
        teal: {
          50: "#eafbfa",
          100: "#c9f3f0",
          200: "#93e6e0",
          300: "#5cd3cb",
          400: "#31b8b0",
          500: "#1c9791",
          600: "#177a76",
          700: "#155f5d",
          800: "#134a49",
          900: "#0e3838",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
