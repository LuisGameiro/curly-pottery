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
        // Arial Rounded MT Bold for headers
        header: ['"Arial Rounded MT Bold"', 'Arial', 'sans-serif'],
        // Aptos for body text
        body: ['Aptos', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}
