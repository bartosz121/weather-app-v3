<script lang="ts">
	import { z } from 'zod';
	import { ForecastUnits } from '$lib/types';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Skycon from './Skycon.svelte';

	interface Props extends HTMLButtonAttributes {
		unit: z.infer<typeof ForecastUnits>;
	}

	let { unit, ...others }: Props = $props();

	let displayUnit = $derived.by(() => {
		switch (unit) {
			case 'imperial':
				return 'F';
			case 'metric':
				return 'C';
			default:
				return 'C';
		}
	});
</script>

<button type="button" {...others}>
	&deg;{displayUnit}
</button>
