/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lumina: {
          50: '#FDFBF7',
          100: '#FAF5EE',
          200: '#F3E9DD',
          300: '#E6D3BF',
          400: '#D5B799',
          500: '#C29873',
          600: '#A97954',
          700: '#8C5E3D',
          800: '#6E482F',
          900: '#4D311E',
          950: '#2A180C',
        },
        roseGold: {
          light: '#F8ECE7',
          DEFAULT: '#B76E79',
          dark: '#934E59',
          subtle: '#E8D5D0',
        },
        champagne: {
          light: '#FAF7F2',
          DEFAULT: '#F1E9DB',
          dark: '#D8CDBA',
        },
        charcoal: {
          50: '#F5F5F7',
          100: '#E5E5EB',
          200: '#D1D1DB',
          300: '#A3A3B3',
          400: '#717182',
          500: '#4B4B59',
          600: '#2F3038',
          700: '#222228',
          800: '#18181C',
          900: '#0F0F11',
          950: '#09090C',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(0, 0, 0, 0.05), 0 0 1px 1px rgba(0,0,0,0.03)',
        'luxury-hover': '0 30px 60px -12px rgba(183, 110, 121, 0.12), 0 0 1px 1px rgba(183, 110, 121, 0.08)',
        'glow-gold': '0 0 25px rgba(212, 175, 55, 0.25)',
      },
    },
  },
  plugins: [],
}
