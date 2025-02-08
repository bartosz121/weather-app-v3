<script module lang="ts">
	import L, { type ControlPosition } from 'leaflet';
	import { getContext, type Snippet } from 'svelte';

	type CustomControlPosition = ControlPosition | 'topcenter' | 'bottomcenter';

	class Control extends L.Control {
		el: HTMLElement;
		constructor(
			el: HTMLElement,
			position: CustomControlPosition | undefined,
			disableClickPropagation: boolean = true
		) {
			super({ position: position as ControlPosition | undefined });
			this.el = el;

			if (disableClickPropagation) {
				L.DomEvent.disableClickPropagation(el);
			}
		}

		onAdd() {
			return this.el;
		}

		onRemove(map: L.Map): void {}
	}
</script>

<script lang="ts">
	interface Props {
		children: Snippet;
		position?: CustomControlPosition;
		disableClickPropagation?: boolean;
		class?: string;
	}

	let {
		children,
		position = 'topleft',
		disableClickPropagation = true,
		class: cls = ''
	}: Props = $props();

	function createControl(el: HTMLElement) {
		$effect(() => {
			const control = new Control(el, position, disableClickPropagation);
			const map = getContext<() => L.Map | null>('map')();
			if (map) {
				control.addTo(map);
			}

			return () => {
				control.remove();
			};
		});
	}
</script>

<div style="display:hidden">
	<div use:createControl class={cls}>
		{@render children()}
	</div>
</div>
