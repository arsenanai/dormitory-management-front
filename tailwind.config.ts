import type { Config } from "tailwindcss";
import plugin from "flowbite/plugin";

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx,vue}",
    "node_modules/flowbite/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E3F2FD" /* Lightest shade */,
          100: "#BBDEFB",
          200: "#90CAF9",
          300: "#64B5F6",
          400: "#42A5F5",
          500: "#2196F3" /* Main SDU blue */,
          600: "#1E88E5",
          700: "#1976D2",
          800: "#1565C0",
          900: "#0D47A1" /* Darkest shade */,
        },
      },
    },
  },
  plugins: [plugin],
  darkMode: "selector",
} as Config;
