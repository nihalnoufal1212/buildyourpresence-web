/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'slide-in-bottom': {
          from: { transform: 'translateY(0.75rem)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'in': 'slide-in-bottom 0.2s ease-out',
        'slide-in-from-bottom-2': 'slide-in-bottom 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
