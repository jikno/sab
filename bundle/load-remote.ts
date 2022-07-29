import { colors, pathUtils } from './deps.ts'

export interface LoadRemoteOptions {
	reload?: boolean
}

export async function loadRemote(url: URL, options: LoadRemoteOptions = {}) {
	const cache = options.reload ? null : await openCache(url)
	if (cache !== null) return cache

	const res = await fetch(url.toString())
	if (!res.ok) {
		if (res.status === 404) return null

		throw new Error(`Received ${res.status} when fetching ${url}`)
	}

	console.log(colors.green('Download'), url.toString())
	if (res.redirected) console.log(colors.yellow('Redirect'), res.url.toString())

	const bytes = new Uint8Array(await res.arrayBuffer())
	await populateCache(url, bytes)

	return bytes
}

function getCacheRoot() {
	const home = Deno.env.get('HOME')
	if (!home) throw new Error('Could not detect os home')

	return pathUtils.join(home, '.cache', 'sab')
}

function getCachePath(url: URL) {
	const key = btoa(url.toString())
	const cachePath = pathUtils.join(getCacheRoot(), key)

	return cachePath
}

async function openCache(url: URL) {
	try {
		return await Deno.readFile(getCachePath(url))
	} catch (_) {
		return null
	}
}

async function populateCache(url: URL, bytes: Uint8Array) {
	const path = getCachePath(url)
	const dir = pathUtils.dirname(path)

	if (!(await exist(dir))) await Deno.mkdir(dir, { recursive: true })

	await Deno.writeFile(path, bytes)
}

export async function clearCache() {
	await Deno.remove(getCacheRoot(), { recursive: true })
}

async function exist(path: string) {
	try {
		await Deno.stat(path)
		return true
	} catch (_) {
		return false
	}
}
