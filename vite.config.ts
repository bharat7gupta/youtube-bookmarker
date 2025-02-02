import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		rollupOptions: {
			input: [
				'popup.html'
			]
		}
	},
	plugins: [
		preact(),
		viteStaticCopy({
			targets: [
				{
					src: 'manifest.json',
					dest: '.'
				},
				{
					src: 'icons/**',
					dest: './icons'
				},
				{
					src: 'background.js',
					dest: '.'
				},
				{
					src: 'common.js',
					dest: '.'
				},
				{
					src: 'contentScript.js',
					dest: '.'
				},
				{
					src: 'styles.css',
					dest: '.'
				}
			]
		})
	],
});
