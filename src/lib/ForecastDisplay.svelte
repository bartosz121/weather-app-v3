<script lang="ts">
	import type { z } from 'zod';
	import ForecastAlerts from './ForecastAlerts.svelte';
	import ForecastDaily from './ForecastDaily.svelte';
	import ForecastDayDetails from './ForecastDayDetails.svelte';
	import ForecastHead from './ForecastHead.svelte';
	import ForecastHourly from './ForecastHourly.svelte';
	import type { AiDaysSummary, ForecastResponse, ForecastUnits, GeosearchResponse } from './types';
	import { stateForecastUnits } from './global.svelte';
	import { goto } from '$app/navigation';

	interface Props {
		forecast: z.infer<typeof ForecastResponse>;
		aiDaysSummary: z.infer<typeof AiDaysSummary> | null;
		reverseGeosearch: z.infer<typeof GeosearchResponse> | null;
		units: z.infer<typeof ForecastUnits>;
	}

	const { forecast, aiDaysSummary, reverseGeosearch, units }: Props = $props();

	let selectedDay = $state(0);

	function changeSelectedDay(n: number) {
		selectedDay = n;
	}

	if (!stateForecastUnits.current) {
		stateForecastUnits.current = units;
	}

	if (units !== stateForecastUnits.current) {
		goto(`?units=${stateForecastUnits.current}`, { replaceState: true, invalidateAll: true });
	}
</script>

<svelte:head>
	<title>Forecast for {reverseGeosearch ? reverseGeosearch.display_name : 'Unknown location'}</title
	>
</svelte:head>

<section
	class="mx-auto mt-4 flex h-screen max-w-screen-2xl flex-col gap-4 bg-black bg-opacity-30 px-4 shadow-[0_0_40px_40px_rgba(0,0,0,0.3)]"
>
	<ForecastHead
		locationName={reverseGeosearch ? reverseGeosearch.display_name : 'Unknown location'}
		forecastCurrent={forecast.current}
		fetchTime={forecast.current.dt}
		locationTimezone={forecast.timezone}
		unit={units}
	/>
	{#if forecast.alerts}
		<ForecastAlerts alertsData={forecast.alerts} locationTimezone={forecast.timezone} />
	{/if}
	<ForecastDaily
		{selectedDay}
		{changeSelectedDay}
		dailyData={forecast.daily}
		unit={units}
		locationTimezone={forecast.timezone}
	/>
	<ForecastHourly hourlyData={forecast.hourly} unit={units} locationTimezone={forecast.timezone} />
	<ForecastDayDetails
		{selectedDay}
		dailyData={forecast.daily}
		{aiDaysSummary}
		locationTimezone={forecast.timezone}
		unit={units}
	/>
</section>
