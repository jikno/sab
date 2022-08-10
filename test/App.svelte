<script lang="ts">
	import { transitions, UI } from './deps.bridge'
	import { AppState } from './state.bridge'

	export let state: AppState

	const { slide } = transitions
	const { photoUrl, token } = state
</script>

<div safe-area class="h-full">
	<div class="p-20 h-full flex flex-col items-stretch justify-center">
		{#if $token}
			<div>
				<h1 class="text-center text-3xl">Hello, {state.name}!</h1>

				<div class="h-20" />

				{#if $photoUrl}
					<div in:slide|local>
						<div class="mx-auto w-200 h-200 rounded-full border-2 border-dark dark:border-light overflow-hidden">
							<UI.Image src={$photoUrl} />
						</div>

						<div class="h-20" />
					</div>

					<button class="btn-spacious w-full" on:click={() => state.removePhoto()}>Remove Selfie</button>
				{:else}
					<button class="btn-primary-spacious w-full" on:click={() => state.takeSelfie()}>Take Selfie</button>
				{/if}
			</div>
		{:else}
			<UI.Auth host="http://localhost:8000" onDone={token => state.login(token)} />
		{/if}
	</div>
</div>
