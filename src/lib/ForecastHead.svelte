<script lang="ts">
	import { z } from 'zod';
	import { ForecastCurrent, ForecastUnits } from './types';
	import { getSkyconsIconForOmwIcon } from './utils';
	import UnitBtn from './UnitBtn.svelte';
	import { stateForecastUnits, switchStateForecastUnits } from './global.svelte';
	import { goto } from '$app/navigation';
	import Skycon from './Skycon.svelte';
	import { Temporal } from 'temporal-polyfill';
	import { navigating } from '$app/state';

	interface Props {
		locationName: string;
		forecastCurrent: z.infer<typeof ForecastCurrent>;
		fetchTime: number;
		locationTimezone: string;
		unit: z.infer<typeof ForecastUnits>;
	}

	let { locationName, forecastCurrent, fetchTime, locationTimezone, unit }: Props = $props();

	let skycon = getSkyconsIconForOmwIcon(forecastCurrent.weather[0].icon);

	let windSpeedDisplay = $derived.by(() => {
		switch (stateForecastUnits.current) {
			case 'metric':
				return `${(forecastCurrent.wind_speed * 3.6).toFixed(2)}km/h`;
			case 'imperial':
				return `${forecastCurrent.wind_speed.toFixed(2)}mph`;
		}
	});
</script>

<section class="flex flex-col items-center gap-1 pt-2 text-white">
	<h2 class="mb-2 text-center text-2xl">{locationName}</h2>
	<div class="flex flex-row items-center gap-3">
		<Skycon icon={skycon} size={100} color="white" animate />
		<div class="flex flex-row gap-2 text-7xl">
			{forecastCurrent.temp}
			<UnitBtn
				class="select-none"
				{unit}
				onclick={async () => {
					goto(`?units=${stateForecastUnits.current === 'imperial' ? 'metric' : 'imperial'}`, {
						replaceState: true
					});
					setTimeout(() => {
						switchStateForecastUnits();
					}, 150);
				}}
			/>
		</div>
	</div>
	<div class="text-3xl capitalize">
		{forecastCurrent.weather[0].description}
	</div>
	<span class="text-xs opacity-80">
		Updated as of{' '}
		{Temporal.Instant.fromEpochSeconds(fetchTime).toLocaleString()}
	</span>
	<div class="mt-2 flex flex-row flex-wrap justify-center gap-3 text-sm md:w-3/4 md:justify-around">
		<div>
			<span class="mr-1">Local time</span>
			{Temporal.Now.instant().toZonedDateTimeISO(locationTimezone).toLocaleString()}
		</div>
		<div>
			Feels like {forecastCurrent.feels_like}
			<UnitBtn {unit} class="inline-block" />
		</div>
		<div>Barometer {forecastCurrent.pressure}hPa</div>
		<div>Humidity {forecastCurrent.humidity}%</div>
		<div>
			Dew Point {forecastCurrent.dew_point}
			<UnitBtn {unit} class="inline-block" />
		</div>
		<div>Clouds {forecastCurrent.clouds}%</div>
		{#if forecastCurrent.visibility}
			<div>Visibility {(forecastCurrent.visibility / 1000).toFixed(2)}km</div>
		{/if}
		<div class="shrink-0">Wind {windSpeedDisplay}</div>
	</div>
</section>
