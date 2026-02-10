/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['"Open Sans"', 'sans-serif'],
			},
			colors: {
				brand: {
					navy: '#00205B',
					blue: '#005596',
					green: '#8CC63F',
					cyan: '#00AEEF',
					bg: '#F4F8FB',
				},
				ui: { text: '#333333', meta: '#666666', border: '#E5E7EB' },
				state: { success: '#28a745', error: '#dc3545' },
			},
			boxShadow: {
				clinical: '0 6px 20px -8px rgba(0, 0, 0, 0.15)',
			},
		},
	},
	plugins: [],
};
