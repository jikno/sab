// deno-lint-ignore no-explicit-any
const capacitor: any | undefined = (window as any)._cap

export function isMobile() {
	if (capacitor) return true

	return false
}

const noCapacitorAccessError =
	'Cannot get capacitor instance because project does not have access to it.  You either need to include `capacitor.js` in your template, or you are not running on mobile.'

export function getCapacitorInstance() {
	if (!isMobile()) throw new Error(noCapacitorAccessError)

	return capacitor.core.Capacitor
}

export function getPlugin(name: string) {
	if (!isMobile()) throw new Error(noCapacitorAccessError)

	const plugin = capacitor.plugins.get(name)
	if (!plugin) throw new Error(`Plugin ${plugin} is not installed.  Did to add it to the plugins array when you called 'buildMobile'?`)

	return plugin
}
