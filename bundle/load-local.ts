export async function loadLocal(url: URL) {
	try {
		return await Deno.readFile(url.pathname)
	} catch (_) {
		return null
	}
}
