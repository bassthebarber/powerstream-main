/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        text: "var(--text)",
        muted: "var(--muted)",
        gold: "var(--gold)",
        gold2: "var(--gold2)",
        ring: "var(--ring)",
      },
    },
  },
  plugins: [],
}
