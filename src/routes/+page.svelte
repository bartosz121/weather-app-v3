<script module lang="ts">
	L.Map.include({
		_initControlPos() {
			const corners: { [key: string]: HTMLElement } = (this._controlCorners = {}),
				l = 'leaflet-',
				container = (this._controlContainer = L.DomUtil.create(
					'div',
					`${l}control-container`,
					this._container
				));

			function createCorner(vSide: string, hSide: string) {
				const className = `${l + vSide} ${l}${hSide}`;

				corners[vSide + hSide] = L.DomUtil.create('div', className, container);
			}

			// order is important for element focus
			createCorner('top', 'left');
			createCorner('bottom', 'left');
			createCorner('bottom', 'center');
			createCorner('bottom', 'right');
			createCorner('top', 'right');
			createCorner('top', 'center');
		}
	});
</script>

<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import markerIcon from 'leaflet/dist/images/marker-icon.png';
	import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
	import markerShadow from 'leaflet/dist/images/marker-shadow.png';
	import L from 'leaflet';
	import { goto } from '$app/navigation';
	import { setContext, tick } from 'svelte';
	import LeafletCustomControl from '$lib/LeafletCustomControl.svelte';
	import LeafletGeosearch from '$lib/LeafletGeosearch.svelte';
	import LeafletCheckForecastBtn from '$lib/LeafletCheckForecastBtn.svelte';
	import { z } from 'zod';
	import { GeosearchResponse } from '$lib/types';
	import { fade } from 'svelte/transition';

	const flyToZoomLevel = 12;
	const maxZoomLevelFlyTo = 8;

	let lat = $state(-9999);
	let lon = $state(-9999);

	let marker = L.marker([-9999, -9999], {
		icon: new L.Icon({
			iconUrl: markerIcon,
			iconRetinaUrl: markerIcon2x,
			shadowUrl: markerShadow,
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			tooltipAnchor: [16, -28],
			shadowSize: [41, 41]
		})
	});
	let map: L.Map | null = null;

	setContext('map', () => map);

	function mapOnClick(e: L.LeafletMouseEvent) {
		lat = e.latlng.lat;
		lon = e.latlng.lng;
		flyTo(lat, lon);
		tick().then(() => document.getElementById('check-forecast-btn')?.focus());
	}

	function flyTo(lat: number, lon: number) {
		if (map) {
			const currentZoom = map.getZoom();
			map.flyTo([lat, lon], currentZoom > maxZoomLevelFlyTo ? currentZoom : flyToZoomLevel);
		}
	}

	function leaflet(element: HTMLDivElement) {
		$effect(() => {
			map = L.map(element, { minZoom: 3, scrollWheelZoom: true }).setView([20, 0], 4);
			marker.addTo(map);
			map.on('click', mapOnClick);
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).addTo(map);

			return () => {
				lat = -9999;
				lon = -9999;
				map?.remove();
				map = null;
			};
		});
	}

	if ('geolocation' in navigator) {
		navigator.geolocation.getCurrentPosition((position) => {
			lat = position.coords.latitude;
			lon = position.coords.longitude;
			flyTo(lat, lon);
		});
	}

	$effect(() => {
		marker.setLatLng([lat, lon]);
	});
</script>

<svelte:head>
	<title>Weather App</title>
</svelte:head>

<div class="h-screen w-screen" use:leaflet transition:fade></div>

<LeafletCustomControl>
	<LeafletGeosearch
		onGeosearchSelect={(item: z.infer<typeof GeosearchResponse>) => {
			const latF = parseFloat(item.lat);
			const lonF = parseFloat(item.lon);
			lat = latF;
			lon = lonF;
			flyTo(latF, lonF);
			tick().then(() => document.getElementById('check-forecast-btn')?.focus());
		}}
	/>
</LeafletCustomControl>
{#if lat !== -9999 && lon !== -9999}
	<LeafletCustomControl position="bottomcenter" class="relative bottom-24">
		<LeafletCheckForecastBtn {lat} {lon} />
	</LeafletCustomControl>
{/if}
