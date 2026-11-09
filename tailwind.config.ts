import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "var(--brand-50, #F0F9F3)",
          100: "var(--brand-100, #DBF1E2)",
          200: "var(--brand-200, #B8E3C6)",
          300: "var(--brand-300, #86CEA1)",
          400: "var(--brand-400, #4DB376)",
          500: "var(--brand-500, #168A45)",
          600: "var(--brand-600, #106B36)",
          700: "var(--brand-700, #0D532B)",
          800: "var(--brand-800, #0B4223)",
          900: "var(--brand-900, #09371E)",
        },
        // Deep green-tinted neutral for headings, dark surfaces and strong badges.
        ink: {
          DEFAULT: "#0F1F15",
          soft: "#1B2E21",
          line: "#2A3F31",
        },
        // Saffron accent reserved for price drops and deal signals.
        accent: {
          50: "#FEF7E6",
          100: "#FCEBC0",
          400: "#F2B33D",
          500: "#E09A12",
          700: "#8A5A00",
        },
        surface: {
          bg: "#F7F9F7",
          card: "#FFFFFF",
          muted: "#EEF3EF",
          border: "#E1E9E3",
        },
        copy: {
          primary: "#202820",
          secondary: "#5F6A61",
          muted: "#7E887F",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.035em",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        'soft-sm': '0 1px 2px rgba(15, 31, 21, 0.05), 0 1px 1px rgba(15, 31, 21, 0.03)',
        'soft-md': '0 6px 16px -4px rgba(15, 31, 21, 0.10), 0 2px 4px -2px rgba(15, 31, 21, 0.05)',
        'soft-lg': '0 18px 40px -12px rgba(15, 31, 21, 0.18), 0 4px 10px -4px rgba(15, 31, 21, 0.06)',
        'card-hover': '0 14px 30px -12px rgba(16, 107, 54, 0.22), 0 4px 10px -4px rgba(15, 31, 21, 0.06)',
      },
    },
  },
  plugins: [],
};
export default config;
