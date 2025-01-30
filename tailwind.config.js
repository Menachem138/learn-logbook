/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/mobile/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#6b7280',
          foreground: '#FFFFFF',
        },
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#f3f4f6',
        },
        border: '#e5e7eb',
        input: '#e5e7eb',
        ring: '#000000',
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}

