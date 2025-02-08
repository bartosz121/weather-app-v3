import { GeosearchResponse } from '$lib/types.js';
import { zodSafeParseErrorToResponse } from '$lib/utils.js';
import { json } from '@sveltejs/kit';
import { z } from 'zod';

export async function GET({ url }) {
	const q = url.searchParams.get('q') ?? '';
	const qParsed = z.string().min(1).max(255).safeParse(q);
	if (!qParsed.success) {
		return json(
			{
				errors: zodSafeParseErrorToResponse(qParsed)
			},
			{ status: 400 }
		);
	}

	const geosearchParams = new URLSearchParams({
		q: qParsed.data,
		limit: '10',
		format: 'jsonv2'
	});

	const url_ = `https://nominatim.openstreetmap.org?${geosearchParams.toString()}`;

	const geosearchResponse = await fetch(url_, { headers: { 'Content-Type': 'application/json' } });
	const geoserachData = await geosearchResponse.json();

	const geosearchDataParsed = z.array(GeosearchResponse).safeParse(geoserachData);
	if (!geosearchDataParsed.success) {
		return json(
			{
				error: 'Unexpected response from geosearch provider'
			},
			{ status: 424, headers: {} }
		);
	}

	return json(geoserachData, { headers: { 'cache-control': 'public, max-age=3600' } });
}
