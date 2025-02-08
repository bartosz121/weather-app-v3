<script lang="ts">
	import type { Component } from 'svelte';
	import type { z } from 'zod';
	import { AiDaysSummary, type ForecastDaily, type ForecastUnits } from './types';
	import ForecastSection from './ForecastSection.svelte';
	import UnitBtn from './UnitBtn.svelte';
	import { stateForecastUnits } from './global.svelte';
	import WiSunrise from '~icons/wi/sunrise';
	import WiSunset from '~icons/wi/sunset';
	import WiMoonrise from '~icons/wi/moonrise';
	import WiMoonset from '~icons/wi/moonset';
	import WiMoonNew from '~icons/wi/moon-new';
	import WiMoonWaxingCrescent2 from '~icons/wi/moon-waxing-crescent-2';
	import WiMoonFirstQuarter from '~icons/wi/moon-first-quarter';
	import WiMoonWaxingGibbous2 from '~icons/wi/moon-waxing-gibbous-2';
	import WiMoonFull from '~icons/wi/moon-full';
	import WiMoonWaningGibbous2 from '~icons/wi/moon-waning-gibbous-2';
	import WiMoonThirdQuarter from '~icons/wi/moon-third-quarter';
	import WiMoonWaningCrescent2 from '~icons/wi/moon-waning-crescent-2';
	import Circle from './Circle.svelte';
	import { fade } from 'svelte/transition';
	import { Temporal } from 'temporal-polyfill';

	function getMoonPhaseData(moonPhase: number): {
		icon: Component;
		phaseName: string;
	} {
		if (moonPhase === 1 || moonPhase === 0) {
			return {
				icon: WiMoonNew,
				phaseName: 'New Moon'
			};
		} else if (moonPhase > 0 && moonPhase < 0.25) {
			return {
				icon: WiMoonWaxingCrescent2,
				phaseName: 'Waxing Crescent'
			};
		} else if (moonPhase === 0.25) {
			return {
				icon: WiMoonFirstQuarter,
				phaseName: 'First Quarter'
			};
		} else if (moonPhase > 0.25 && moonPhase < 0.5) {
			return {
				icon: WiMoonWaxingGibbous2,
				phaseName: 'Waxing Gibbous'
			};
		} else if (moonPhase === 0.5) {
			return {
				icon: WiMoonFull,
				phaseName: 'Full Moon'
			};
		} else if (moonPhase > 0.5 && moonPhase < 0.75) {
			return {
				icon: WiMoonWaningGibbous2,
				phaseName: 'Waning Gibbous'
			};
		} else if (moonPhase === 0.75) {
			return {
				icon: WiMoonThirdQuarter,
				phaseName: 'Third Quarter'
			};
		} else if (moonPhase > 0.75 && moonPhase < 1) {
			return {
				icon: WiMoonWaningCrescent2,
				phaseName: 'Waning Crescent'
			};
		} else {
			return {
				icon: WiMoonNew,
				phaseName: 'New Moon'
			};
		}
	}

	interface Props {
		selectedDay: number;
		dailyData: z.infer<typeof ForecastDaily>[];
		aiDaysSummary: z.infer<typeof AiDaysSummary> | null;
		locationTimezone: string;
		unit: z.infer<typeof ForecastUnits>;
	}

	let { selectedDay, dailyData, aiDaysSummary, locationTimezone, unit }: Props = $props();

	let moonPhaseData = $derived(getMoonPhaseData(dailyData[selectedDay].moon_phase));
</script>

<ForecastSection
	class="my-4 px-1 text-white"
	title={`Day Details - ${Temporal.Instant.fromEpochSeconds(dailyData[selectedDay].dt)
		.toZonedDateTimeISO(locationTimezone)
		.toLocaleString(undefined, {
			weekday: 'long',
			day: 'numeric'
		})}`}
>
	<section class="flex flex-row flex-wrap gap-16 px-2 py-4 text-lg md:px-4">
		<ForecastSection class="shrink-0 grow basis-12">
			<div class="mt-1 flex flex-col md:px-2">
				<h4 class="mb-1 py-1 tracking-wide">
					{#if aiDaysSummary}
						{aiDaysSummary[selectedDay].summary}
					{:else if dailyData[selectedDay].weather.length > 0 && dailyData[selectedDay].weather[0].description}
						{@const description = dailyData[selectedDay].weather[0].description}
						{@const capitalizedDescription =
							description.charAt(0).toUpperCase() + description.slice(1)}
						{capitalizedDescription}
					{/if}
				</h4>
				{#if dailyData[selectedDay].rain}
					<div class="flex flex-row">
						<span class="mr-1">Rain</span>
						<span>{dailyData[selectedDay].rain.toFixed(2)} mm</span>
					</div>
				{/if}
				{#if dailyData[selectedDay].snow}
					<div class="flex flex-row">
						<span class="mr-1">Snow</span>
						<span>{dailyData[selectedDay].snow.toFixed(2)} mm</span>
					</div>
				{/if}
				<div class="flex flex-row">
					<span class="mr-1">Morning</span>
					<span>{dailyData[selectedDay].temp.morn.toFixed(2)}</span>
					<UnitBtn {unit} />
				</div>
				<div class="flex flex-row">
					<span class="mr-1">Day</span>
					<span>{dailyData[selectedDay].temp.day.toFixed(2)}</span>
					<UnitBtn {unit} />
				</div>
				<div class="flex flex-row">
					<span class="mr-1">Evening</span>
					<span>{dailyData[selectedDay].temp.eve.toFixed(2)}</span>
					<UnitBtn {unit} />
				</div>
				<div class="flex flex-row">
					<span class="mr-1">Night</span>
					<span>{dailyData[selectedDay].temp.night.toFixed(2)}</span>
					<UnitBtn {unit} />
				</div>
			</div>
		</ForecastSection>
		<ForecastSection class="shrink-0 grow basis-12">
			<div class="mt-1 md:px-2">
				<div>
					<h4 class="font-semibold">Sunrise</h4>
					<span class="flex flex-row items-center gap-2">
						<WiSunrise class="h-16 w-16" />
						{Temporal.Instant.fromEpochSeconds(dailyData[selectedDay].sunrise)
							.toZonedDateTimeISO(locationTimezone)
							.toLocaleString(undefined, {
								hour: 'numeric',
								minute: 'numeric'
							})}
					</span>
				</div>
				<div>
					<h4 class="font-semibold">Sunset</h4>
					<span class="flex flex-row items-center gap-2">
						<WiSunset class="h-16 w-16" />
						{Temporal.Instant.fromEpochSeconds(dailyData[selectedDay].sunset)
							.toZonedDateTimeISO(locationTimezone)
							.toLocaleString(undefined, {
								hour: 'numeric',
								minute: 'numeric'
							})}
					</span>
				</div>
			</div>
		</ForecastSection>
		<ForecastSection class="shrink-0 grow basis-12">
			<div class="mt-1 md:px-2">
				<div>
					<h4 class="font-semibold">Moonrise</h4>
					<span class="flex flex-row items-center gap-2">
						<WiMoonrise class="h-16 w-16" />
						{Temporal.Instant.fromEpochSeconds(dailyData[selectedDay].moonrise)
							.toZonedDateTimeISO(locationTimezone)
							.toLocaleString(undefined, {
								hour: 'numeric',
								minute: 'numeric'
							})}
					</span>
				</div>
				<div>
					<h4 class="font-semibold">Moonset</h4>
					<span class="flex flex-row items-center gap-2">
						<WiMoonset class="h-16 w-16" />
						{Temporal.Instant.fromEpochSeconds(dailyData[selectedDay].moonset)
							.toZonedDateTimeISO(locationTimezone)
							.toLocaleString(undefined, {
								hour: 'numeric',
								minute: 'numeric'
							})}
					</span>
				</div>
				<div>
					<h4 class="font-semibold">Moon Phase</h4>
					<span class="flex flex-row items-center gap-2">
						<moonPhaseData.icon class="h-16 w-16" />
						<span>{moonPhaseData.phaseName}</span>
					</span>
				</div>
			</div>
		</ForecastSection>
		<ForecastSection class="shrink-0 grow basis-12">
			<div class="mt-1 flex flex-row flex-wrap justify-around gap-6 md:px-2">
				<div class="flex flex-col items-center">
					<p class="mb-2 font-semibold">Precipitation</p>
					<Circle value={dailyData[selectedDay].pop * 100}>
						<span class="text-lg">{`${(dailyData[selectedDay].pop * 100).toFixed(0)}%`}</span>
					</Circle>
					<!-- <CircularProgressbar
						class="h-24 w-24"
						styles={circularProgressbarStyle}
						value={precipitation}
						maxValue={1}
						text={`${(precipitation * 100).toFixed(0)}%`}
					/> -->
				</div>
				<div class="flex flex-col items-center">
					<p class="mb-2 font-semibold">Humidity</p>
					<Circle value={dailyData[selectedDay].humidity}>
						<span class="text-lg">{`${dailyData[selectedDay].humidity.toFixed(0)}%`}</span>
					</Circle>
					<!-- <CircularProgressbar
						class="h-24 w-24"
						styles={circularProgressbarStyle}
						value={humidity}
						text={`${humidity.toFixed(0)}%`}
					/> -->
				</div>
				<div class="flex flex-col items-center">
					<p class="mb-2 font-semibold">UV Index</p>
					<Circle value={dailyData[selectedDay].uvi} max={10}>
						<span class="text-lg"
							>{Math.ceil(dailyData[selectedDay].uvi) < 10
								? Math.ceil(dailyData[selectedDay].uvi).toFixed(0)
								: 10}</span
						>
					</Circle>
					<!-- <CircularProgressbar
						class="h-24 w-24"
						styles={circularProgressbarStyle}
						value={uvIndex}
						maxValue={10}
						text={`${Math.ceil(uvIndex) < 10 ? Math.ceil(uvIndex).toFixed(0) : 10}`}
					/> -->
				</div>
				<div class="flex flex-col items-center">
					<p class="mb-2 font-semibold">Pressure</p>
					<Circle value={dailyData[selectedDay].pressure} min={980} max={1030}>
						<span class="text-lg">{`${dailyData[selectedDay].pressure.toFixed(0)}hPa`}</span>
					</Circle>
					<!-- <CircularProgressbar
						class="h-24 w-24"
						styles={circularProgressbarStyle}
						value={pressure}
						minValue={980}
						maxValue={1030}
						text={`${pressure.toFixed(0)}hPa`}
					/> -->
				</div>
			</div>
		</ForecastSection>
	</section>
</ForecastSection>

<!-- <ForecastSection
	class="my-4 px-1 text-white"
	title={(
		<div>
			<span>Day Details - </span>
			<DisplayDt dt={dailyData[selectedDay].dt * 1000} dtFormat={dtFormatDayDayLongWNum} />
		</div>
	)}
>
	<section class="flex flex-row flex-wrap gap-16 py-4 px-2 md:px-4">
		<GeneralDayInfoSection class="shrink-0 grow basis-12" dailyData={dailyData[selectedDay]} />
		<SunDayInfoSection
			class="shrink-0 grow basis-12"
			sunRise={dailyData[selectedDay].sunrise * 1000}
			sunSet={dailyData[selectedDay].sunset * 1000}
			{locationTimezone}
		/>
		<MoonDayInfoSection
			class="shrink-0 grow basis-12"
			moonRise={dailyData[selectedDay].moonrise * 1000}
			moonSet={dailyData[selectedDay].moonset * 1000}
			moonPhase={dailyData[selectedDay].moon_phase}
			{locationTimezone}
		/>
		<CircularDayInfoSection
			class="shrink-0 grow basis-12"
			precipitation={dailyData[selectedDay].pop}
			humidity={dailyData[selectedDay].humidity}
			uvIndex={dailyData[selectedDay].uvi}
			pressure={dailyData[selectedDay].pressure}
		/>
	</section>
</ForecastSection> -->
