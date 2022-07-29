// import { SvelteTransformation } from './transform-svelte.ts'

// export interface SvelteCache {
// 	fileMtime: number
// 	transformation: SvelteTransformation
// }

// function urlToSvelteCache(url: URL) {
// 	return `_svelte-transformation-cache:${btoa(url.toString())}`
// }

// export async function openSvelteCache(url: URL): Promise<SvelteTransformation | null> {
// 	const storageKey = urlToSvelteCache(url)
// 	const cache = (await storage.getJson(storageKey)) as SvelteCache

// 	if (!cache) return null
// 	if (url.protocol !== 'file:') return cache.transformation

// 	const fileStat = await Deno.stat(url.pathname)
// 	if (!fileStat.mtime) return null

// 	if (fileStat.mtime.getTime() !== cache.fileMtime) return null

// 	return cache.transformation
// }

// export async function populateSvelteCache(url: URL, transformation: SvelteTransformation) {
// 	const storageKey = urlToSvelteCache(url)
// 	const cache: SvelteCache = { fileMtime: Date.now(), transformation }

// 	if (url.protocol !== 'file:') return await storage.setJson(storageKey, cache)

// 	const fileStat = await Deno.stat(url.pathname)
// 	if (fileStat.mtime) cache.fileMtime = fileStat.mtime.getTime()

// 	await storage.setJson(storageKey, cache)
// }
