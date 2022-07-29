import { pathUtils, utils } from '../deps.ts'
import { generateIndexHtml, generateRollupConfig, generateWindowExposer } from './boilerplate.ts'

export async function setupCapacitor(cwd: string) {
	// Create node project
	await utils.shIgnore('npm init -y', { cwd })

	// Install deps
	const deps = ['@capacitor/core']
	const devDeps = [
		'@capacitor/cli',
		'@capacitor/android',
		'@capacitor/ios',
		'rollup',
		'@rollup/plugin-node-resolve',
		'@rollup/plugin-commonjs',
	]
	await utils.shIgnore(`npm install ${deps.join(' ')}`, { cwd })
	await utils.shIgnore(`npm install -D ${devDeps.join(' ')}`, { cwd })

	// Init capacitor
	await utils.shIgnore('npx cap add ios', { cwd })
	await utils.shIgnore('npx cap add android', { cwd })
	await utils.writeText(pathUtils.join(cwd, 'cap.js'), generateWindowExposer())

	// Init rollup
	await utils.writeText(pathUtils.join(cwd, 'rollup.config.js'), generateRollupConfig())

	// Get rollup to run with an 'npm run bundle' command
	const pkgJson = await utils.readJson(pathUtils.join(cwd, 'package.json'))
	pkgJson.scripts.bundle = 'rollup -c'
	await utils.writeJson(pathUtils.join(cwd, 'package.json'), pkgJson)
}

export async function setupMobileStatics(cwd: string) {
	await utils.writeText(pathUtils.join(cwd, 'index.html'), generateIndexHtml())
}
