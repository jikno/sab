// deno-lint-ignore-file

declare type Props = Record<string, any>

declare class SvelteComponentDev {
	constructor(params: { target?: HTMLElement; props?: Props })

	$set(props?: Props): void
	$on(event: string, callback: (event: any) => void): () => void
	$destroy(): void
	[accessor: string]: any
}

declare const component: typeof SvelteComponentDev
export default component
