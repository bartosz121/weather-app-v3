<script lang="ts">
	import type { HTMLCanvasAttributes } from 'svelte/elements';

	// @ts-ignore
	import Skycons from '$lib/skycons.js';
	import type { SkyconsIcon } from './types';

	interface Props extends HTMLCanvasAttributes {
		icon: SkyconsIcon;
		size?: number;
		color?: string;
		resizeClear?: boolean;
		animate?: boolean;
	}

	let {
		icon,
		size = 25,
		color = 'black',
		resizeClear = true,
		animate = true,
		...props
	}: Props = $props();

	function skycon(element: HTMLCanvasElement) {
		const skycons = new Skycons({ color, resizeClear });
		skycons.add(element, icon);

		$effect(() => {
			if (animate) {
				skycons.play();
			}

			return () => {
				skycons.pause();
				skycons.remove(element);
			};
		});
	}
</script>

<canvas width={size} height={size} {...props} use:skycon> </canvas>
