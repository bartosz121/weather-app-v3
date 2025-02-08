import { GeosearchResponse, GeosearchReverseResponse, Latitude, Longitude } from '$lib/types.js';
import { zodErrorToResponse, zodSafeParseErrorToResponse } from '$lib/utils.js';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

export async function GET({ url }) {
	const latQ = parseFloat(url.searchParams.get('lat') ?? '');
	const lonQ = parseFloat(url.searchParams.get('lon') ?? '');

	const latParsed = Latitude.safeParse(latQ);
	const lonParsed = Longitude.safeParse(lonQ);

	const errors = [];
	if (!latParsed.success) {
		errors.push(zodErrorToResponse(latParsed.error));
	}
	if (!lonParsed.success) {
		errors.push(zodErrorToResponse(lonParsed.error));
	}

	if (errors.length) {
		return json(
			{
				errors: errors
			},
			{ status: 400 }
		);
	}

	const lat = latParsed.data!;
	const lon = lonParsed.data!;

	const geosearchParams = new URLSearchParams({
		lat: lat.toString(),
		lon: lon.toString(),
		zoom: '18',
		addressdetails: '0',
		format: 'jsonv2'
	});

	const url_ = `https://nominatim.openstreetmap.org/reverse?${geosearchParams.toString()}`;

	const reverseGeosearchResponse = await fetch(url_, {
		headers: { 'Content-Type': 'application/json' }
	});
	const reverseGeoserachData = await reverseGeosearchResponse.json();

	const reverseGeosearchDataParsed = GeosearchReverseResponse.safeParse(reverseGeoserachData);
	if (!reverseGeosearchDataParsed.success) {
		return json(
			{
				error: 'Unexpected response from reverse geosearch provider'
			},
			{ status: 424, headers: {} }
		);
	}

	return json(reverseGeoserachData, { headers: { 'cache-control': 'public, max-age=3600' } });
}
