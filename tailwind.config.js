/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 苍白笔记主题色
        background: '#1a1a1a',
        surface: '#262626',
        text: {
          primary: '#e5e5e5',
          secondary: '#a3a3a3',
          muted: '#525252',
        },
        accent: {
          mansus: '#a855f7', // 紫色
          grail: '#ef4444',  // 红色
          lantern: '#f59e0b', // 黄色
          edge: '#84cc16',   // 绿色
          winter: '#cbd5e1', // 苍白/冰蓝
          moth: '#fef08a',   // 蛾色
        }
      },
      fontFamily: {
        serif: ['"Merriweather"', '"Noto Serif SC"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
