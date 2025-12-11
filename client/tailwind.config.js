/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1D63ED', // Docker Blue
                secondary: '#64748b', // Slate-500
                accent: '#22C55E', // Green (Success)
                dark: '#091E42', // Docker Navy
                light: '#F4F5F7', // Docker Light Gray
                'docker-bg': '#F9FAFB',
                'docker-border': '#E5E7EB',
            }
        },
    },
    plugins: [],
}
