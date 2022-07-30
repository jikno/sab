// @deno-types=../svelte.d.ts
import App from './App.svelte'
import { getCapacitorInstance, isMobile } from '../runtime.ts'
import { setupJiknoDesign } from '../../design/mod.ts'

setupJiknoDesign()

new App({
	target: document.body,
	props: { name: 'Elijah Mooring' },
})

if (isMobile()) {
	const Capacitor = getCapacitorInstance()

	console.log('Platform:', Capacitor.getPlatform())
}
