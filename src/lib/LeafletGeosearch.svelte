<script lang="ts">
	import { tick } from 'svelte';
	import { GeosearchResponse } from '$lib/types.js';
	import Spinner from './Spinner.svelte';
	import type { z } from 'zod';

	type GeosearchResponseType = z.infer<typeof GeosearchResponse>;

	interface Props {
		onGeosearchSelect: (item: GeosearchResponseType) => void;
	}

	let { onGeosearchSelect }: Props = $props();

	let abortController = new AbortController();
	let inputOpen = $state(false);
	let isLoading = $state(false);
	let inputValue = $state('');
	let geosearchOptions: GeosearchResponseType[] = $state([]);
	let selectedOption: GeosearchResponseType | null = $state(null);
	let focusedOptionIndex: number | null = $state(null);
	let error = $state('');

	function closeGeosearchAndReset() {
		inputOpen = true;
		inputValue = '';
		focusedOptionIndex = null;
		geosearchOptions = [];
		error = '';
		selectedOption = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!geosearchOptions.length) {
			return;
		}

		const options = document.querySelectorAll<HTMLElement>('#geosearch-listbox [role="option"]');
		const lastIndex = options.length - 1;
		let newIndex = focusedOptionIndex ?? 0;

		switch (e.key) {
			case 'ArrowUp':
				e.preventDefault();
				newIndex = newIndex > 0 ? newIndex - 1 : lastIndex;
				break;

			case 'ArrowDown':
				e.preventDefault();
				newIndex = newIndex < lastIndex ? newIndex + 1 : 0;
				break;

			case 'Tab':
				if (focusedOptionIndex === lastIndex && !e.shiftKey) {
					// If tabbed on last option, move "naturally" to next element
					focusedOptionIndex = null;
					return;
				}
				if (focusedOptionIndex === 0 && e.shiftKey) {
					// If tabbed with shift on first element, move up to input
					e.preventDefault();
					focusedOptionIndex = null;
					document.getElementById('geosearch-input')?.focus();
					return;
				}
				e.preventDefault();
				newIndex = e.shiftKey ? newIndex - 1 : newIndex + 1;
				break;

			case 'Enter':
				e.preventDefault();
				inputValue = geosearchOptions[focusedOptionIndex!].display_name;
				selectedOption = geosearchOptions[focusedOptionIndex!];
				geosearchOptions = [];
				return;

			case 'Escape':
				closeGeosearchAndReset();
				document.getElementById('geosearch-input-btn')?.focus();
				return;
		}

		newIndex = (newIndex + options.length) % options.length;
		focusedOptionIndex = newIndex;
		options[newIndex]?.focus();
	}

	function handleInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Tab' && geosearchOptions.length > 0) {
			e.preventDefault();
			if (e.shiftKey) {
				inputOpen = false;
				focusedOptionIndex = null;
				document.getElementById('geosearch-input-btn')?.focus();
			} else {
				focusedOptionIndex = 0;
				document.getElementById('geosearch-option-0')?.focus();
			}
		} else if (e.key === 'Escape') {
			closeGeosearchAndReset();
			document.getElementById('geosearch-input-btn')?.focus();
		}
	}

	function clearOptionFocusOnOutsideClick(node: HTMLElement) {
		$effect(() => {
			function handleClick(event: MouseEvent) {
				if (!node.contains(event.target as Node)) {
					focusedOptionIndex = null;
				}
			}

			document.addEventListener('click', handleClick, true);

			return () => {
				document.removeEventListener('click', handleClick, true);
			};
		});
	}

	$effect(() => {
		error = '';
		if (!inputValue || inputValue.length < 2 || inputValue == selectedOption?.display_name) {
			return;
		}
		abortController.abort();
		abortController = new AbortController();

		const t = setTimeout(async () => {
			try {
				isLoading = true;
				geosearchOptions = [];
				const queryParams = new URLSearchParams({ q: inputValue });
				const response = await fetch(`/api/geosearch?${queryParams.toString()}`, {
					signal: abortController.signal
				});
				if (!response.ok) {
					throw new Error('Failed to fetch results');
				}
				geosearchOptions = await response.json();
			} catch (err) {
				error = '';
				geosearchOptions = [];

				if (err instanceof Error) {
					if (err.name === 'AbortError') {
						// Do nothing
					} else {
						error = err.message;
					}
				} else {
					error = 'Failed to fetch results';
				}
			} finally {
				isLoading = false;
			}

			if (geosearchOptions.length > 0) {
				focusedOptionIndex = 0;
				if (document.activeElement?.id === 'geosearch-input') {
					document.getElementById('geosearch-option-0')?.focus();
				}
			}
		}, 500);

		return () => {
			clearTimeout(t);
		};
	});

	$effect(() => {
		if (selectedOption) {
			onGeosearchSelect(selectedOption);
			tick().then(() => document.getElementById('check-forecast-btn')?.focus());
		}
	});
</script>

<div class="leaflet-bar mb-4 w-fit">
	<button
		id="geosearch-input-btn"
		aria-label={inputOpen ? 'Close location search' : 'Open location search'}
		aria-haspopup="true"
		aria-expanded={inputOpen}
		aria-controls="geosearch-input"
		onclick={async (e) => {
			e.preventDefault();
			inputOpen = !inputOpen;
			if (inputOpen) {
				await tick();
				document.getElementById('geosearch-input')?.focus();
			}
		}}
	>
		<a
			tabindex="-1"
			href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
			aria-labelledby="geosearch-input-btn"
			style="display:flex;"
			class="select-none items-center justify-center"
		>
			<svg
				aria-labelledby="geosearch-input-btn"
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				viewBox="0 0 22 22"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg
			>
		</a>
	</button>
</div>
<div class={{ 'w-[300px]': 'a', invisible: !inputOpen }}>
	<input
		id="geosearch-input"
		onkeydown={handleInputKeydown}
		bind:value={inputValue}
		class={{
			'w-[300px] rounded-t border-b-0 border-l border-r border-t border-slate-500 border-opacity-50 text-sm tracking-wide focus:border-slate-500 focus:border-opacity-50 focus:outline-none focus:ring-0': true,
			'border-b-1 rounded-b': geosearchOptions.length === 0 || isLoading || error
		}}
		type="text"
		role="combobox"
		aria-controls="geosearch-listbox"
		aria-autocomplete="list"
		aria-activedescendant={focusedOptionIndex !== null
			? `geosearch-option-${focusedOptionIndex}`
			: undefined}
		aria-expanded={geosearchOptions.length === 0}
		autocomplete="off"
		autocorrect="off"
	/>
	<ul
		use:clearOptionFocusOnOutsideClick
		id="geosearch-listbox"
		class="border-1 rounded-b border-b border-l border-r border-slate-500 border-opacity-50 bg-white shadow-lg"
		role="listbox"
		aria-labelledby="geosearch-input"
		aria-busy={isLoading}
		onkeydown={handleKeydown}
		onblur={() => (focusedOptionIndex = null)}
	>
		{#if isLoading}
			<div class="mb-4 flex justify-center">
				<Spinner />
			</div>
		{/if}
		{#if error}
			<div aria-live="assertive" class="mb-4 text-center">{error}</div>
		{/if}
		{#if geosearchOptions}
			{#each geosearchOptions as option, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					id={`geosearch-option-${i}`}
					role="option"
					aria-selected={focusedOptionIndex === i}
					tabindex={focusedOptionIndex === i ? 0 : -1}
					class={{
						'mx-2 cursor-pointer px-1 py-2 hover:bg-gray-200 focus:bg-gray-200': 'a',
						'bg-gray-200': focusedOptionIndex === i
					}}
					onclick={() => {
						inputValue = option.display_name;
						selectedOption = option;
						geosearchOptions = [];
					}}
					onfocus={() => (focusedOptionIndex = i)}
				>
					{option.display_name}
				</li>
			{/each}
		{/if}
	</ul>
</div>
