/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                slate: {
                    50: '#f0f6fc',
                    100: '#c9d1d9',
                    200: '#b1bac4',
                    300: '#8b949e',
                    400: '#8b949e',
                    500: '#6e7681',
                    600: '#484f58',
                    700: '#30363d',
                    800: '#21262d',
                    900: '#161b22', // Panels & sidebars
                    950: '#0d1117', // Main app background
                },
                blue: { // Override blue to be our hacker green accent
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981', // Main Accent
                    600: '#059669', // Hover
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                    950: '#022c22',
                },
                indigo: { // Override indigo to match the green accent
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981', // Main Accent
                    600: '#059669', // Hover
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                    950: '#022c22',
                },
                purple: { // Override purple (used somewhere)
                    400: '#34d399',
                    500: '#10b981',
                },
                emerald: { // Explicitly set emerald to be identical if used directly
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                }
            }
        },
    },
    plugins: [],
}
