<script lang="ts">
	import { takeSelfie } from './svelte.help'

	export let name: string
	let imagePath: string | null = null

	async function getSelfie() {
		const path = await takeSelfie()
		imagePath = path
	}
</script>

<div safe-area class="h-full">
	<div class="p-20 h-full flex flex-col items-stretch justify-center">
		<div>
			<h1 class="text-center text-3xl">Hello, {name}!</h1>

			<div class="h-20" />

			{#if imagePath}
				<div
					class="mx-auto w-200 h-200 rounded-full border-2 boder-red bg-center bg-cover bg-no-repeat"
					style="background-image: url('{imagePath}')"
				/>

				<div class="h-20" />

				<button class="btn-spacious w-full" on:click={() => (imagePath = null)}> Remove Selfie </button>
			{:else}
				<button class="btn-primary-spacious w-full" on:click={getSelfie}>Take Selfie</button>
			{/if}
		</div>
	</div>
</div>
