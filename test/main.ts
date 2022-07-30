// @deno-types=../svelte.d.ts
import App from './App.svelte'
import { setupJiknoDesign } from '../../design/mod.ts'

setupJiknoDesign()

new App({
	target: document.body,
	props: { name: 'Elijah Mooring' },
})
