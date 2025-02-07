import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		rollupOptions: {
			input: [
				'src/popup.html'
			],
		},
		emptyOutDir: false
	},
	plugins: [preact()],
});
