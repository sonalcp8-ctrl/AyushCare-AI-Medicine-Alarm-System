/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        elder: {
          dark: '#0f172a',
          navy: '#1e293b',
          emerald: '#10b981',
          coral: '#ef4444',
          amber: '#f59e0b',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 1.5s infinite',
      }
    },
  },
  plugins: [],
}
