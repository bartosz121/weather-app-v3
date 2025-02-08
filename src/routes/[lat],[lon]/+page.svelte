<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import ForecastDisplay from '$lib/ForecastDisplay.svelte';
	import FullPageSpinner from '$lib/FullPageSpinner.svelte';
	import { getBackgroundImage } from '$lib/utils';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	const { data } = $props();

	onMount(() => {
		const interval = setInterval(
			() => {
				invalidateAll();
			},
			60 * 5 * 1000
		);

		return () => {
			clearInterval(interval);
		};
	});
</script>

{#await data.loadData}
	<FullPageSpinner />
{:then loadData}
	{@const backgroundImage = getBackgroundImage(loadData.forecast.current.weather[0].icon)}
	<main
		transition:fade
		class="fixed h-full w-full overflow-y-auto bg-cover bg-center bg-no-repeat"
		style={`background-image: url("${backgroundImage.img.src}")`}
	>
		<section
			class="mx-auto mt-4 flex h-screen max-w-screen-2xl flex-col gap-4 bg-black bg-opacity-30 px-4 shadow-[0_0_40px_40px_rgba(0,0,0,0.3)]"
		>
			<ForecastDisplay
				forecast={loadData.forecast}
				aiDaysSummary={loadData.aiDaysSummary}
				reverseGeosearch={loadData.reverseGeosearch}
				units={loadData.units}
			/>
		</section>
	</main>
{/await}
