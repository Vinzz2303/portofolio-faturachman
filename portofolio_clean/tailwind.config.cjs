module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#0b0d12',
        accent: '#25d0c3',
        neon: '#4ea8de',
        gold: '#d6b15d',
      },
      backgroundImage: {
        'spotlight': 'radial-gradient(circle at 50% 50%, rgba(78, 168, 222, 0.1) 0%, transparent 80%)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
