<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div
	in:fade={{ duration: 100 }}
	out:fade={{ duration: 500, delay: 1000 }}
	class="fixed inset-0 z-[5000] flex items-center justify-center bg-black"
>
	<div
		class="h-16 w-16 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-white"
	></div>
</div>
