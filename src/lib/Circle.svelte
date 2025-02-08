<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Spring, Tween } from 'svelte/motion';

	interface Props {
		value: number;
		min?: number;
		max?: number;
		size?: number;
		strokeWidth?: number;
		children?: Snippet;
	}

	let { value, min = 0, max = 100, size = 100, strokeWidth = 8, children }: Props = $props();

	let progress = $derived(Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)));
	let center = $derived(size / 2);
	let radius = $derived(center - strokeWidth / 2);
	let circumference = $derived(2 * Math.PI * radius);
	let spring = new Spring(0, { stiffness: 0.05 });

	$effect(() => {
		spring.set(circumference - (progress / 100) * circumference);
	});
</script>

<div class="relative h-32 w-32">
	<svg class="h-full w-full" viewBox="0 0 100 100">
		<circle class="stroke-gray-200" stroke-width="8" fill="transparent" />

		<circle
			class="stroke-white"
			stroke-width={strokeWidth}
			fill="transparent"
			r={radius}
			cx={center}
			cy={center}
			stroke-dasharray={circumference}
			stroke-dashoffset={spring.current}
			style={`transform: rotate(-90deg); transform-origin: center;`}
		/>
	</svg>

	<div class="absolute inset-0 flex items-center justify-center text-white">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>
