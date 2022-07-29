import { parse } from 'https://deno.land/std@0.149.0/flags/mod.ts'
import { buildMobile, buildWeb, openMobile } from '../mod.ts'

const args = parse(Deno.args)._
const command = args[0]

if (command === 'mobile') {
	await buildMobile({
		inputFile: 'main.ts',
		outputDir: 'platforms/mobile',
		watch: true,
		appId: 'com.vehmloewff.captest',
		appName: 'Cap Mobile Test',
		reload: true,
		plugins: ['@capacitor/camera'],
	})

	await openMobile({
		outputDir: 'platforms/mobile',
		IDE: 'ios',
	})
} else if (command === 'web') {
	await buildWeb({
		inputFile: 'main.ts',
		outputDir: 'platforms/web',
		watch: true,
	})
} else {
	throw new Error(
		command
			? `The command "${command}" is not recognized.  Valid commands are "mobile", and "web"`
			: 'You must specify a command.  Valid commands are "mobile", and "web".'
	)
}
