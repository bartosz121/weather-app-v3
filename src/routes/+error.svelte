<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getBackgroundImage } from '$lib/utils';
	import { fade } from 'svelte/transition';
	const values = [
		'01d',
		'01n',
		'02d',
		'02n',
		'03d',
		'03n',
		'04d',
		'04n',
		'09d',
		'09n',
		'10d',
		'10n',
		'11d',
		'11n',
		'13d',
		'13n',
		'50d',
		'50n'
	];

	const backgroundImage = getBackgroundImage(values[Math.floor(Math.random() * values.length)]);
	console.error(page.error);
</script>

<section
	transition:fade
	class="fixed h-full w-full overflow-y-auto bg-cover bg-center bg-no-repeat"
	style={`background-image: url("${backgroundImage.img.src}")`}
>
	<section class="h-full w-full text-white">
		<div
			class="mx-auto flex h-full max-w-screen-2xl flex-col items-center justify-center gap-4 bg-black bg-opacity-30 px-4 shadow-[0_0_40px_40px_rgba(0,0,0,0.3)]"
		>
			<h1 class="mb-6 text-center text-3xl tracking-wide lg:text-7xl">Something went wrong</h1>
			<div class="flex flex-col items-center gap-6">
				<button
					class="border border-white bg-white bg-opacity-10 px-6 py-2 text-center text-xl transition-all hover:border-opacity-100 hover:bg-opacity-40 lg:text-3xl"
					onclick={() => window.location.reload()}>Try again</button
				>
				<span class="lg:text-xl">or</span>
				<button
					class="border border-white bg-white bg-opacity-10 px-6 py-2 text-center text-xl transition-all hover:border-opacity-100 hover:bg-opacity-40 lg:text-3xl"
					onclick={() => goto('/')}>Choose another location</button
				>
			</div>
		</div>
	</section>
</section>
