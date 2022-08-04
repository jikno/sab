import { esBuild, pathUtils, base64, unwindCompiler } from './deps.ts'
import { transformSvelte } from './transform-svelte.ts'
import { loadLocal } from './load-local.ts'
import { loadRemote } from './load-remote.ts'
import { colors } from '../deps.ts'
import { runUnwind } from './css.ts'

interface ResolverParams {
	reload: boolean
	unwindParams: UnwindParams
}

const resolver = (params: ResolverParams): esBuild.Plugin => ({
	name: 'resolver',
	setup(build) {
		build.onResolve({ filter: /.+/ }, args => {
			const resolveDir = args.importer ? urlDirname(args.importer) : `file://${args.resolveDir}`

			if (args.path.startsWith('file://') || args.path.startsWith('http://') || args.path.startsWith('https://'))
				return { path: args.path, namespace: 'resolve' }

			const importingUrl = new URL(resolveDir)

			if (args.path.startsWith('/'))
				return buildResolveResult({
					protocol: importingUrl.protocol,
					host: importingUrl.host,
					pathname: args.path,
				})

			const newPath = addExtension(args.importer, pathUtils.join(importingUrl.pathname, args.path))

			return buildResolveResult({
				protocol: importingUrl.protocol,
				host: importingUrl.host,
				pathname: newPath,
			})
		})

		build.onLoad({ filter: /./ }, async args => {
			const fileUrl = args.path
			const url = new URL(fileUrl)

			const bytes = url.protocol === 'file:' ? await loadLocal(url) : await loadRemote(url, { reload: params.reload })
			if (!bytes) return { errors: [{ text: `Module not found.  Cannot load ${url}` }] }

			// We have this unusual function notation here to make it easier to debug
			const debug = async (debugMatcher?: RegExp) => {
				const result = await (async () => {
					if (fileUrl.endsWith('.ts')) return { contents: decode(bytes), loader: 'ts' }
					if (fileUrl.endsWith('.tsx')) return { contents: runUnwind(decode(bytes), url, params.unwindParams), loader: 'tsx' }
					if (fileUrl.endsWith('.svelte')) return await transformSvelte(decode(bytes), url, params.unwindParams)
					if (fileUrl.endsWith('.jpeg')) return transformToString(buildBase64DataUrl('image/jpeg', base64.encode(bytes)))
					if (fileUrl.endsWith('.png')) return transformToString(buildBase64DataUrl('image/png', base64.encode(bytes)))
					if (fileUrl.endsWith('.svg')) return transformToString(buildBase64DataUrl('image/svg+xml', base64.encode(bytes)))
					if (fileUrl.endsWith('.txt')) return { contents: decode(bytes), loader: 'text' }
					if (fileUrl.endsWith('.html')) return { contents: decode(bytes), loader: 'text' }
					if (fileUrl.endsWith('.css')) return transformCss(decode(bytes))
					if (fileUrl.endsWith('.json')) return { contents: decode(bytes), loader: 'json' }

					return { contents: decode(bytes) }
				})()

				if (debugMatcher && debugMatcher.test(fileUrl)) {
					console.log(`================`)
					console.log('debug:', fileUrl)
					console.log('----------------')
					console.log(result.contents)
				}

				return result
			}

			return debug()
		})
	},
})

export interface BuildUrlParams {
	protocol: string | null
	host: string | null
	pathname: string
}

function buildResolveResult(params: BuildUrlParams): esBuild.OnResolveResult {
	if (params.protocol === 'file:')
		return {
			path: `file://${params.pathname}`,
			namespace: 'resolve',
			watchFiles: [params.pathname],
		}

	return {
		path: `${params.protocol}//${params.host}${params.pathname}`,
		namespace: 'resolve',
	}
}

function addExtension(importer: string, path: string) {
	if (!importer.endsWith('.svelte')) return path
	if (!pathUtils.basename(path).includes('.')) return `${path}.ts`

	return path
}

function urlDirname(url: string) {
	const sections = url.split('/')
	sections.pop()

	return sections.join('/')
}

function decode(bytes: Uint8Array) {
	return new TextDecoder().decode(bytes)
}

function buildBase64DataUrl(mimeType: string, base64Content: string) {
	return `data:${mimeType};base64,${base64Content}`
}

function transformToString(content: string) {
	return { contents: `export default \`${content.replaceAll('`', '\\`')}\`` }
}

function transformCss(css: string) {
	const code = `const css = \`${css.replaceAll('`', '\\`')}\`

const element = document.createElement('style')
element.textContent = css

document.head.appendChild(element)`

	return { contents: code }
}

function closeOpenResources(initialResources: Deno.ResourceMap) {
	const currentResources = Deno.resources()

	for (const rid in currentResources) {
		if (initialResources[rid] !== undefined) continue

		Deno.close(parseInt(rid))
	}
}

export interface UnwindParams extends unwindCompiler.InsertUnwindHooks {
	/**  If `true`, Sab will not attempt to add Unwind runtime callers to remote modules */
	noCompileRemote?: boolean
	/** If `true`, Sab will not attempt to add Unwind runtime callers to local modules */
	noCompileLocal?: boolean
}

export interface BundleParams {
	/** The file to start the bundle pipeline at */
	inputFile: string
	/** The location to write the bundled js */
	outputFile: string
	/** If `true`, the filesystem will be watched and rebuilt any time a file changes which could invalidate the build */
	watch?: boolean
	/** If `true` bundler will not read from the cache when fetching remote modules */
	reload?: boolean
	/** Will be called every time the bundle is rebuilt.  Ignored if `watch` is false. */
	onRebuildDone?(): Promise<void>
	/** Parameters to configure Unwind with */
	unwind?: UnwindParams
}

/** Bundle a module graph into a single JS file.  Function resolves after the first build, even if `watch` is `true`. */
export async function bundle(params: BundleParams) {
	let isFirstBuild = true
	const initialResources = Deno.resources()
	const errors: string[] = []

	const watcherLog = (message: string) => console.log(colors.blue('Watcher'), message)

	async function emitLog() {
		const stat = await Deno.stat(params.outputFile)
		const kb = (stat.size / 1024).toFixed(2)

		console.log(colors.green('Emit'), params.outputFile, colors.gray(`${kb}kb`))
	}

	async function onRebuild() {
		isFirstBuild = false

		watcherLog('Rebuilt due to changes')
		await emitLog()

		if (params.onRebuildDone) await params.onRebuildDone()
	}

	try {
		await esBuild.build({
			watch: params.watch ? { onRebuild } : false,
			entryPoints: [params.inputFile],
			bundle: true,
			outfile: params.outputFile,
			plugins: [resolver({ reload: params.reload || false, unwindParams: params.unwind || {} })],
			format: 'iife',
		})

		await emitLog()
		if (params.watch) watcherLog('Waiting for changes to rebuild...')
	} catch (error) {
		errors.push(error.message)
	}

	if (errors.length) {
		if (params.watch && !isFirstBuild) watcherLog('Build Failed.  Waiting for changes to restart...')
		else if (params.watch) throw new Error('Build failed.  File watcher could not recover')
		else throw new Error('Bundle failed')
	}

	if (!params.watch || errors.length) closeOpenResources(initialResources)
}

export { clearCache } from './load-remote.ts'
