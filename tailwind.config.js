/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/platform/web-components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // RTL-specific customizations
      rtl: {
        direction: 'rtl',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  variants: {
    extend: {
      flexDirection: ['rtl'],
      textAlign: ['rtl']
    }
  }
}
