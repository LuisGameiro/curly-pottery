module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: ['outline-hidden'],
  theme: {
    extend: {
      fontFamily: {
        header: ['"Arial Rounded MT Bold"', 'Arial', 'sans-serif'],
        body: ['Aptos', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}
