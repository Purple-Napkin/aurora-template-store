import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Pick up utilities used in @aurora-studio/starter-core (e.g. CatalogueFilters sidebar md:block)
    "./node_modules/@aurora-studio/starter-core/dist/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        aurora: {
          bg: "var(--aurora-bg, #fafaf9)",
          surface: "var(--aurora-surface, #ffffff)",
          "surface-hover": "var(--aurora-surface-hover, #f4f4f5)",
          border: "var(--aurora-border, #e4e4e7)",
          accent: "var(--aurora-accent, #ea580c)",
          primary: "var(--aurora-primary, #1e3a8a)",
          "primary-dark": "var(--aurora-primary-dark, #1e40af)",
          muted: "var(--aurora-muted, #52525b)",
          text: "var(--aurora-text, #18181b)",
        },
      },
      borderRadius: {
        container: "12px",
        card: "8px",
        component: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
