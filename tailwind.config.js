/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '6rem',
        '2xl': '8rem',
      },
    },
    extend: {
      colors: {
        noir: {
          950: '#0A0A0A',
          900: '#121212',
          850: '#1A1A1A',
          800: '#1F1F1F',
          750: '#262626',
          700: '#2D2D2D',
          600: '#404040',
          500: '#525252',
        },
        amber: {
          50: '#FDF8F1',
          100: '#F9EEDD',
          200: '#F2D9B5',
          300: '#E9C086',
          400: '#D4A574',
          500: '#C28A4A',
          600: '#A06B32',
          700: '#7D5026',
        },
        emerald: {
          900: '#1F3D35',
          800: '#2D5549',
          700: '#3D6B5E',
          600: '#4E8273',
          500: '#68A08F',
          400: '#8EC5B3',
        },
        wine: {
          700: '#5C1A1A',
          600: '#7A2626',
          500: '#993636',
          400: '#B84D4D',
        },
        parchment: {
          50: '#F5F0E6',
          100: '#EDE5D5',
          200: '#DED1B8',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Lora"', 'Georgia', 'serif'],
        handwritten: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        'noir': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'amber-glow': '0 0 20px rgba(212, 165, 116, 0.3)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'inset-noir': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        'pulse-amber': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'stamp': {
          '0%': { transform: 'scale(2)', opacity: '0' },
          '50%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'typewriter': {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 165, 116, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 165, 116, 0.6)' },
        },
      },
      animation: {
        'pulse-amber': 'pulse-amber 2s ease-in-out infinite',
        'radar-sweep': 'radar-sweep 3s linear infinite',
        'stamp': 'stamp 0.3s ease-out forwards',
        'typewriter': 'typewriter 2s steps(40) forwards',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
