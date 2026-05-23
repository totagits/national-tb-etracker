/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          blue: '#004e89',    // Deep health blue
          light: '#e6f0fa',
        },
        primary: '#004e89',
        secondary: '#0a8754', // Green
        accent: '#ffb703',    // Amber
        danger: '#d90429',    // Red for overdue items
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
