<script lang="ts">
	import { goto } from '$app/navigation';

	interface Props {
		lat: number;
		lon: number;
	}

	let { lat, lon }: Props = $props();

	function handleClick() {
		goto(`/${lat},${lon}`);
	}
</script>

<button
	tabindex="0"
	id="check-forecast-btn"
	onclick={handleClick}
	class="border-1 cursor-pointer rounded-lg border border-slate-500 border-opacity-50 bg-white px-12 py-4 text-lg tracking-wide shadow-lg transition-all hover:bg-gray-200 focus:border-gray-600 focus:ring-1 focus:ring-black"
	>Check forecast</button
>
