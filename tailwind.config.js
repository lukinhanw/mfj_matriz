/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{html,js,jsx}"
	],
	darkMode: 'class', // Habilita o modo escuro baseado em classe
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
				},
			},
			keyframes: {
				success: {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				check: {
					'0%': { transform: 'scale(0)' },
					'50%': { transform: 'scale(1.2)' },
					'100%': { transform: 'scale(1)' }
				}
			},
			animation: {
				success: 'success 0.3s ease-out',
				check: 'check 0.5s ease-in-out'
			}
		},
	},
	plugins: [
		require('@tailwindcss/forms'),
	],
}
