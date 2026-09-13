/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0b0f1a',
          900: '#0f1524',
          800: '#151d30',
          700: '#1c2740',
        },
        brand: {
          cyan: '#22d3ee',
          blue: '#3b82f6',
        },
        status: {
          ontime: '#16a34a',
          delayed: '#dc2626',
          warning: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 21, 36, 0.04), 0 4px 12px rgba(15, 21, 36, 0.06)',
        card: '0 1px 3px rgba(15, 21, 36, 0.06), 0 8px 24px rgba(15, 21, 36, 0.08)',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(1.3)' },
        },
        fadeSlideIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        toastIn: {
          '0%': { opacity: 0, transform: 'translateX(16px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        fadeSlideIn: 'fadeSlideIn 0.35s ease-out',
        toastIn: 'toastIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
