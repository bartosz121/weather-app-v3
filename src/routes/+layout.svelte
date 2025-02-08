<script lang="ts">
	import '../app.css';
	import { navigating } from '$app/state';
	import { fade } from 'svelte/transition';
	import { Temporal } from 'temporal-polyfill';
	import FullPageSpinner from '$lib/FullPageSpinner.svelte';

	let { children } = $props();
</script>

{#if navigating.to}
	<FullPageSpinner />
{/if}
{@render children()}
