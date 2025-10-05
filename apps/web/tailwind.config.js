/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f2ff',
          100: '#e6e3ff',
          200: '#c7c1ff',
          300: '#a29aff',
          400: '#7b5cff',
          500: '#5a31f4',
          600: '#4523d0',
          700: '#3319a3',
          800: '#22106f',
          900: '#140940',
        },
        accent: {
          100: '#fff7e6',
          200: '#ffe4b8',
          400: '#ffc15a',
          500: '#f89f1b',
          600: '#d9780a',
        },
        success: {
          100: '#ddfbf5',
          200: '#aef4e5',
          400: '#2dd4bf',
          600: '#0f9c82',
        },
        danger: {
          100: '#ffe4e8',
          200: '#fdb9c2',
          400: '#fb7185',
          600: '#dc3a4f',
        },
        neutral: {
          50: '#f8f9fc',
          100: '#eef1f8',
          200: '#d7dbe7',
          300: '#bec4d6',
          400: '#9ea4bb',
          500: '#7c84a2',
          600: '#5b6382',
          700: '#3e4460',
          800: '#292f45',
          900: '#1a1f2f',
        },
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f5f7fb',
          elevated: '#ffffff',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Inter', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'hero-radial': 'radial-gradient(circle at 20% 20%, rgba(122, 95, 255, 0.55), transparent 55%), radial-gradient(circle at 80% 0%, rgba(45, 212, 191, 0.35), transparent 60%)',
        'section-sheen': 'linear-gradient(135deg, rgba(90, 49, 244, 0.08), rgba(124, 67, 255, 0))',
      },
      boxShadow: {
        'glow': '0 25px 45px -20px rgba(90, 49, 244, 0.45)',
        'card': '0 22px 55px -28px rgba(15, 16, 45, 0.45)',
      },
    },
  },
  plugins: [],
}