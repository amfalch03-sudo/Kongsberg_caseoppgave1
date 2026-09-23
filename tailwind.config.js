/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef5fb",
          100: "#d8e8f5",
          700: "#17456f",
          800: "#0f3354",
          900: "#08263f",
          950: "#041a2c"
        },
        preparedness: {
          green: "#15803d",
          mint: "#dff7e8",
          amber: "#f59e0b",
          red: "#dc2626"
        }
      },
      boxShadow: {
        panel: "0 18px 45px rgba(8, 38, 63, 0.10)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
