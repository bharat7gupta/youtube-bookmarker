import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				'contentScript.js': 'src/contentScript.tsx'
			},
			output: [
				{
					entryFileNames: 'contentScript.js',
					format: 'iife'
				}
			]
		},
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
					dest: './icons',
				},
				{
					src: 'src/background.js',
					dest: '.'
				},
				{
					src: 'src/styles.css',
					dest: '.'
				}
			],
		})
	],
});
