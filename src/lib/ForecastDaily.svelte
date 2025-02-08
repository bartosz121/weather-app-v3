<script lang="ts">
	import type { z } from 'zod';
	import type { ForecastDaily, ForecastUnits } from './types';
	import ForecastSection from './ForecastSection.svelte';
	import { getSkyconsIconForOmwIcon } from './utils';
	import Card from './Card.svelte';
	import UnitBtn from './UnitBtn.svelte';
	import { stateForecastUnits } from './global.svelte';
	import Skycon from './Skycon.svelte';
	import { scrollHorizontally } from './scrollHorizontally.svelte';
	import { Temporal } from 'temporal-polyfill';

	interface Props {
		selectedDay: number;
		changeSelectedDay: (n: number) => void;
		dailyData: z.infer<typeof ForecastDaily>[];
		unit: z.infer<typeof ForecastUnits>;
		locationTimezone: string;
	}

	let { selectedDay, changeSelectedDay, dailyData, unit, locationTimezone }: Props = $props();
</script>

<ForecastSection class="my-4 px-1 text-white" title="Daily">
	<div
		class="my-2 flex flex-row overflow-scroll overflow-x-auto overflow-y-hidden text-white"
		use:scrollHorizontally
	>
		{#each dailyData as item, i (`daily-${i}`)}
			{@const skycon = getSkyconsIconForOmwIcon(item.weather[0].icon)}
			<Card
				onClick={() => changeSelectedDay(i)}
				extraClass={selectedDay === i
					? 'shrink-0 grow basis-44 border-opacity-100 bg-opacity-40'
					: 'shrink-0 grow basis-44'}
			>
				<div class="flex flex-col items-center justify-center">
					{Temporal.Instant.fromEpochSeconds(item.dt)
						.toZonedDateTimeISO(locationTimezone)
						.toLocaleString(undefined, {
							weekday: 'long',
							day: 'numeric'
						})}
					<!-- <DisplayDt dt={item.dt * 1000} dtFormat={dtFormatDayShortWNum} /> -->
					<span>
						<Skycon icon={skycon} color="white" size={50} />
					</span>
					<span class="text-center capitalize">{item.weather[0].description}</span>
					<div>
						<span>{item.temp.day}</span>
						<UnitBtn class="inline-block" {unit} />
					</div>
					<div class="opacity-60">
						<span>{item.feels_like.day}</span>
						<UnitBtn class="inline-block" {unit} />
					</div>
				</div>
			</Card>
		{/each}
	</div>
</ForecastSection>
