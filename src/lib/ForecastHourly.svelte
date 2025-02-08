<script lang="ts">
	import type { z } from 'zod';
	import type { ForecastHourly, ForecastUnits } from './types';
	import ForecastSection from './ForecastSection.svelte';
	import { getSkyconsIconForOmwIcon } from './utils';
	import Card from './Card.svelte';
	import UnitBtn from './UnitBtn.svelte';
	import { stateForecastUnits } from './global.svelte';
	import Skycon from './Skycon.svelte';
	import { scrollHorizontally } from './scrollHorizontally.svelte';
	import { Temporal } from 'temporal-polyfill';

	interface Props {
		hourlyData: z.infer<typeof ForecastHourly>[];
		unit: z.infer<typeof ForecastUnits>;
		locationTimezone: string;
	}

	let { hourlyData, unit, locationTimezone }: Props = $props();
</script>

<ForecastSection class="my-4 px-1 text-white" title="Hourly">
	<div
		class="my-2 flex flex-row overflow-scroll overflow-x-auto overflow-y-hidden"
		use:scrollHorizontally
	>
		{#each hourlyData as item, i (`hourly-${i}`)}
			{@const skycon = getSkyconsIconForOmwIcon(item.weather[0].icon)}
			<Card extraClass="shrink-0 grow basis-44">
				<div class="flex flex-col items-center justify-center">
					{Temporal.Instant.fromEpochSeconds(item.dt)
						.toZonedDateTimeISO(locationTimezone)
						.toLocaleString(undefined, {
							weekday: 'short',
							hour: 'numeric'
						})}
					<span>
						<Skycon icon={skycon} color="white" size={50} />
					</span>
					<span class="text-center capitalize">{item.weather[0].description}</span>
					<div>
						<span>{item.temp}</span>
						<UnitBtn class="inline-block" {unit} />
					</div>
					<div class="opacity-60">
						<span>{item.feels_like}</span>
						<UnitBtn class="inline-block" {unit} />
					</div>
				</div>
			</Card>
		{/each}
	</div>
</ForecastSection>
