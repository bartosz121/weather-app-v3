<script lang="ts">
	import type { z } from 'zod';
	import ForecastSection from './ForecastSection.svelte';
	import type { ForecastAlert } from './types';
	import { Temporal } from 'temporal-polyfill';

	interface Props {
		alertsData: z.infer<typeof ForecastAlert>[];
		locationTimezone: string;
	}

	let { alertsData, locationTimezone }: Props = $props();
</script>

<ForecastSection title="Alerts" class="my-4">
	{#each alertsData as item, i (`alert-${i}`)}
		<section class="my-2 bg-white bg-opacity-20 p-2 text-white transition-all hover:bg-opacity-40">
			<h3 class="text-xl font-medium capitalize">{item.event}</h3>
			<p class="text-sm opacity-60">{item.sender_name}</p>
			<p class="text-sm opacity-60">
				{Temporal.Instant.fromEpochSeconds(item.start)
					.toZonedDateTimeISO(locationTimezone)
					.toLocaleString()}
				<span> to </span>
				{Temporal.Instant.fromEpochSeconds(item.end)
					.toZonedDateTimeISO(locationTimezone)
					.toLocaleString()}
			</p>
			<p class="mt-1">{item.description}</p>
		</section>
	{/each}
</ForecastSection>
