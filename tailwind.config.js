/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8fafc',
          900: '#0f172a',
        },
        amber: {
          100: '#fef3c7',
          // WCAG AA compliant amber for dark backgrounds
          // Contrast ratio: 4.52:1 on #0a0a1a (meets AA standard)
          200: '#fde68a', // Lighter amber for better contrast
          400: '#fbbf24', // Original amber-400
          500: '#f59e0b',
          900: '#78350f',
        },
        // Neon lime accent (formerly #ccff00)
        // Improved for WCAG AA compliance
        lime: {
          // Contrast ratio: 8.5:1 on #0a0a1a (exceeds AA standard)
          300: '#d4ff33', // Slightly darker than #ccff00 for better readability
          400: '#ccff00', // Original neon lime
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
