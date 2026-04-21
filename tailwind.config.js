/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0d1117',
        surface: '#161b22',
        panel: '#1c2128',
        border: '#30363d',
        accent: '#f97316',
        'accent-dim': '#ea580c',
        muted: '#8b949e',
        subtle: '#21262d',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
