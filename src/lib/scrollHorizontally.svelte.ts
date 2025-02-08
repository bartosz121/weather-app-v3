export function scrollHorizontally(element: HTMLElement) {
	function handleWheel(e: WheelEvent) {
		if (!e.shiftKey) {
			e.preventDefault();
			element.scrollLeft += e.deltaY;
		}
	}

	$effect(() => {
		element.addEventListener('wheel', handleWheel);

		return () => {
			element.removeEventListener('wheel', handleWheel);
		};
	});
}
