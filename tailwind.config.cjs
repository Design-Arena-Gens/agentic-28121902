/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090F",
        surface: "#11111A",
        surfaceElevated: "#161621",
        accent: {
          DEFAULT: "#5B5BD6",
          foreground: "#F4F3FF"
        },
        muted: "#8D8DB3",
        border: "#1F1F2E",
        foreground: "#EBECF5",
        codeBg: "#0F0F1A"
      },
      fontFamily: {
        sans: ["'Inter Variable'", "Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(91, 91, 214, 0.25)"
      }
    }
  },
  plugins: []
};
