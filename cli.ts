import { parse } from 'https://deno.land/std@0.149.0/flags/mod.ts'
import { buildMobile, buildWeb, openMobile } from 'https://code.jikno.com/sab@master/mod.ts'
import * as utils from 'https://deno.land/x/dtils@1.3.0/mod.ts'

const params = parse(Deno.args, {
	alias: { w: 'watch' },
	string: ['open'],
	boolean: ['watch', 'reload'],
})
const args = params._
const command = args[0]

const config = await utils.readJson('sab.config.json')

if (command === 'mobile') {
	await buildMobile({
		inputFile: 'main.ts',
		outputDir: 'platforms/mobile',
		appId: 'com.example.app',
		appName: 'Example App',
		watch: params.watch,
		reload: params.reload,
		...config,
	})

	if (params.open) {
		if (params.open !== 'ios' && params.open !== 'android') throw new Error('Expected --open to be either "ios" or "android"')

		await openMobile({
			outputDir: 'platforms/mobile',
			IDE: params.open,
		})
	}
} else if (command === 'web') {
	await buildWeb({
		inputFile: 'main.ts',
		outputDir: 'platforms/web',
		watch: params.watch,
		reload: params.reload,
		...config,
	})
} else {
	throw new Error(
		command
			? `The command "${command}" is not recognized.  Valid commands are "mobile", and "web"`
			: 'You must specify a command.  Valid commands are "mobile", and "web".'
	)
}
