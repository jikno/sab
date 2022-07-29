import { shIgnore } from 'https://denopkg.com/Vehmloewff/deno-utils@master/mod.ts'
import { colors, pathUtils, utils } from '../deps.ts'
import { bundle } from '../mod.ts'
import { generatePluginsList } from './boilerplate.ts'
import { CapacitorConfig } from './config.ts'
import { setupCapacitor, setupMobileStatics } from './setup.ts'

export interface BuildMobileParams {
	/** The bundle identifier of the mobile application */
	appId: string
	/** A user-friendly name for your app - it's what will appear beneath the app icon on the home screen */
	appName: string
	/** The input file for the project */
	inputFile: string
	/** The folder where the mobile-specific code and outputs are located */
	outputDir: string
	/** If true, the builder will rebuild when any files change that could invalidate the last build */
	watch?: boolean
	/** If true, the bundler will not load any remote modules from the cache */
	reload?: boolean
	/** The capacitor plugins to load.  These plugins will be be available with a call to `getPlugin` */
	plugins?: string[]
	/** Additional configuration options that can be passed to capacitor */
	capacitorConfig?: CapacitorConfig
}

/** Build project for the mobile platforms, ios and android */
export async function buildMobile(params: BuildMobileParams) {
	const capDir = pathUtils.join(params.outputDir, 'capacitor')
	const webDir = pathUtils.join(params.outputDir, 'www')

	const writeCapacitorConfig = () =>
		utils.writeJson(pathUtils.join(capDir, 'capacitor.config.json'), {
			appId: params.appId,
			appName: params.appName,
			webDir: '../www',
			...(params.capacitorConfig || {}),
		})

	async function sync() {
		// Write the capacitor config
		await writeCapacitorConfig()

		// Bundle the capacitor plugins
		await bundlePlugins(capDir, params.plugins || [])

		// Bundle the project
		await bundle({
			watch: params.watch,
			reload: params.reload,
			inputFile: params.inputFile,
			outputFile: pathUtils.join(params.outputDir, 'www/build/bundle.js'),
			async onRebuildDone() {
				// And then sync the changes to the platform-specific projects
				await capacitorSync(capDir)
			},
		})

		// After we have bundled, sync the latest changes over to the platform projects
		await capacitorSync(capDir)
	}

	// If the web assets directory does not exist, generate a simple and mobile-friendly index.html
	if (!(await utils.exists(webDir))) {
		await setupMobileStatics(webDir)

		console.log(colors.green('Write'), pathUtils.join(webDir, 'index.html'))
		console.log(
			colors.gray(
				`The ${webDir} directory should be checked into version control, but the ${pathUtils.join(
					webDir,
					'build'
				)} directory should not be.`
			)
		)
	}

	// If the capacitor project does not exist, create it
	if (!(await utils.exists(capDir))) {
		await writeCapacitorConfig()
		await setupCapacitor(capDir)

		console.log(colors.green('Emit'), capDir)
		console.log(colors.gray(`The ${capDir} directory should NOT be checked into version control`))
	}

	await sync()
}

export interface OpenMobileParams {
	/** The folder where the mobile-specific code and outputs are located */
	outputDir: string
	/** The specific app IDE to open */
	IDE: 'ios' | 'android'
}

/** Open the app-specific IDE for editing platform-specific code and configurations */
export async function openMobile(params: OpenMobileParams) {
	await shIgnore(`npx cap open ${params.IDE}`, { cwd: pathUtils.join(params.outputDir, 'capacitor') })

	console.log(colors.blue('Open'), colors.gray(`${params.IDE} code IDE`))
}

async function bundlePlugins(capDir: string, plugins: string[]) {
	const pkgJson = await utils.readJson(pathUtils.join(capDir, 'package.json'))

	// Install any plugins not already installed
	for (const plugin of plugins) {
		if (pkgJson.dependencies[plugin]) continue

		await utils.shIgnore(`npm install ${plugin}`, { cwd: capDir })
		console.log(colors.yellow('Install'), colors.gray(`Capacitor plugin ${plugin}`))
	}

	// Uninstall any plugins not supposed to be installed
	for (const dependency in pkgJson.dependencies) {
		if (dependency === '@capacitor/core') continue
		if (~plugins.indexOf(dependency)) continue

		await utils.shIgnore(`npm uninstall ${dependency}`, { cwd: capDir })
		console.log(colors.yellow('Uninstall'), colors.gray(`Capacitor plugin ${dependency}`))
	}

	// Glob all of the plugins
	await utils.writeText(pathUtils.join(capDir, 'plugins.js'), generatePluginsList(plugins))

	// And then bundle what was globbed...
	await utils.shIgnore('npm run bundle', { cwd: capDir })

	// Nice terminal notification
	console.log(colors.green('Emit'), pathUtils.join(capDir, '../www/build/capacitor.js'))
}

async function capacitorSync(capDir: string) {
	await utils.shIgnore('npx cap sync', { cwd: capDir })

	console.log(colors.magenta(colors.bold('Updated')), colors.gray('Ios and Android projects have been updated'))
}
