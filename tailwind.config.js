/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#0b0d0f',
        foreground: '#e8edf2',
        muted: '#9aa7b5',
        border: 'rgba(255,255,255,0.06)',
        accent: '#6b8cff',
        'accent-hover': '#5a7ae8',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(107, 140, 255, 0.15)',
      },
    },
  },
  plugins: [],
};