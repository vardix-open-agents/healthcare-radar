/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        varden: {
          dark: '#18181b',
          darker: '#09090b',
          accent: '#06b6d4',
          'accent-hover': '#22d3ee',
        },
      },
    },
  },
  plugins: [],
};
