import { heroui } from '@heroui/react'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50:  '#f5f5ef',
          100: '#e9ebe2',
          200: '#d4d9ca',
          300: '#aebba3',
          400: '#7c8d70',
          500: '#46583f',
          600: '#344636',
          700: '#2b382c',
          800: '#232f24',
          900: '#1c251d',
        },
        lavender: {
          100: '#F3EEFF',
          200: '#E5D5FF',
          300: '#C9AAFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl': '0.3rem',
        '2xl': '0.4rem',
        '3xl': '0.5rem',
        '4xl': '0.6rem',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(#f6f5f0, #f6f5f0)',
        'taobao-gradient': 'linear-gradient(#46583f, #46583f)',
      }
    },
  },
  plugins: [heroui()],
}
