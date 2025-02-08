<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		extraClass?: string;
		onClick?: () => void;
	}

	let { children, extraClass, onClick }: Props = $props();
</script>

<button
	type="button"
	class={`border border-white border-opacity-0 bg-white bg-opacity-20 text-center transition-all hover:border-opacity-100 hover:bg-opacity-40 ${extraClass ?? extraClass}`}
	onclick={onClick ? onClick : null}
>
	{@render children()}
</button>
