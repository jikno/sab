// @deno-types=../svelte.d.ts
import App from './App.svelte'
import { setupJiknoDesign } from '../../design/mod.ts'
import { getPlugin, isMobile } from '../runtime.ts'
import { AppState } from './state.bridge.ts'
// import { start } from './main.tsx'

setupJiknoDesign()

// start()
new App({
	target: document.body,
	props: { state: new AppState() },
})

if (isMobile()) {
	getPlugin('@capacitor/splash-screen').SplashScreen.hide()
}

// 311.56kb
// 125.01kb
