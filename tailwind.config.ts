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
        surface: {
          bg: "#F7F9F7",
          card: "#FFFFFF",
          border: "#E5ECE5",
        },
        copy: {
          primary: "#202820",
          secondary: "#707870",
          muted: "#949C94",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(32, 40, 32, 0.05), 0 1px 2px rgba(32, 40, 32, 0.03)',
        'soft-md': '0 4px 12px -1px rgba(32, 40, 32, 0.08), 0 2px 6px -1px rgba(32, 40, 32, 0.04)',
        'soft-lg': '0 12px 24px -4px rgba(32, 40, 32, 0.10), 0 4px 8px -2px rgba(32, 40, 32, 0.05)',
        'card-hover': '0 16px 32px -4px rgba(22, 138, 69, 0.12), 0 6px 12px -2px rgba(32, 40, 32, 0.05)',
      },
    },
  },
  plugins: [],
};
export default config;

