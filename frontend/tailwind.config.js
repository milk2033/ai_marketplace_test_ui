/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'noir': {
                    'bg': '#0a0a0a',
                    'card': '#1a1a1a',
                    'accent': '#2a2a2a',
                    'primary': '#00ff9d',
                    'secondary': '#ff00ff',
                    'text': '#e0e0e0',
                    'muted': '#666666'
                }
            },
            fontFamily: {
                'tech': ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'neon': '0 0 5px theme(colors.noir.primary), 0 0 20px theme(colors.noir.primary)',
                'neon-secondary': '0 0 5px theme(colors.noir.secondary), 0 0 20px theme(colors.noir.secondary)',
            }
        },
    },
    plugins: [],
} 