/** @type {import('tailwindcss').Config} */
module.exports = {
  // 👇 Scan everywhere you keep React files, but exclude node_modules & dist
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",

    // If you’ve got alt or backup dirs under studio-app, include them:
    "./*backup*/**/*.{js,jsx,ts,tsx}",
    "./_*/*.{js,jsx,ts,tsx}",

    // Catch-all inside this app folder
    "./**/*.{js,jsx,ts,tsx,html}",

    // EXCLUDES:
    "!./node_modules/**",
    "!./dist/**"
  ],

  // A few classes we KNOW you use on the gold landing page, in case anything is missed
  safelist: [
    "bg-yellow-400","text-black","text-center","grid","sm:grid-cols-2",
    "rounded-2xl","shadow-soft","font-bold","text-lg","px-5","py-4",
    "min-h-[70vh]","text-brand-gold","bg-black","max-w-3xl","w-full","px-6"
  ],

  theme: {
    extend: {
      colors: { brand: { gold: "#ffd54a", dark: "#0b0b0b" } },
      boxShadow: { soft: "0 8px 24px rgba(0,0,0,.35)" }
    }
  },
  plugins: [],
};
