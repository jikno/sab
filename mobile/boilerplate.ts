export function generatePluginsList(plugins: string[]) {
	const map = `export const plugins = new Map()`
	const loader = plugins.map((name, index) => `import * as plugin${index} from '${name}'`).join('\n')
	const stash = plugins.map((name, index) => `plugins.set('${name}', plugin${index})`).join('\n')

	return `${loader}\n\n${map}\n\n${stash}\n`
}

export function generateWindowExposer() {
	return `\
import * as core from '@capacitor/core'
import { plugins } from './plugins'

window._cap = {
	core,
	plugins
}
`
}

export function generateRollupConfig() {
	return `\
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
	input: 'cap.js',
	output: {
		file: '../www/build/capacitor.js',
		format: 'iife',
		inlineDynamicImports: true,
	},
	plugins: [
		resolve({
			browser: true,
		}),
		commonjs(),
	],
};
`
}

export function generateIndexHtml() {
	return `\
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
		/>

		<script src="build/capacitor.js"></script>
		<script src="build/bundle.js" defer></script>
		
		<style>
			[safe-area] {
				padding-top: env(safe-area-inset-top);
				padding-right: env(safe-area-inset-right);
				padding-bottom: env(safe-area-inset-bottom);
				padding-left: env(safe-area-inset-left);
			}
		</style>
	</head>
	<body ontouchstart=""></body>
</html>	
`
}
