<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	let { title, children, ...other }: SvelteHTMLElements['div'] = $props();
</script>

<div {...other}>
	{#if title}
		<h2 class="text-2xl text-white">{title}</h2>
	{/if}
	{#if children}
		<div class="border-t border-white">
			{@render children()}
		</div>
	{/if}
</div>
