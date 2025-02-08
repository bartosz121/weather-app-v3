import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { ForecastResponse, ForecastUnits, Latitude, Longitude } from '$lib/types';
import { OPENWEATHERMAP_APPID } from '$env/static/private';
import { zodSafeParseErrorToResponse } from '$lib/utils';
import { cache } from '$lib/cache';

const OPENWEATHERMAP_BASE_URL = 'https://api.openweathermap.org/data/3.0/onecall';

const PostBody = z.object({
	lat: Latitude,
	lon: Longitude,
	units: ForecastUnits
});

export async function POST({ request }) {
	const postBodyParsed = PostBody.safeParse(await request.json());
	if (!postBodyParsed.success) {
		return json(
			{
				errors: zodSafeParseErrorToResponse(postBodyParsed)
			},
			{ status: 400 }
		);
	}

	const cacheKey = `${postBodyParsed.data.lat.toFixed(3)},${postBodyParsed.data.lon.toFixed(3)},${postBodyParsed.data.units}`;
	let forecastData = cache.get(cacheKey);

	if (forecastData === null) {
		const forecastParams = new URLSearchParams({
			lat: postBodyParsed.data.lat.toString(),
			lon: postBodyParsed.data.lon.toString(),
			units: postBodyParsed.data.units,
			appid: OPENWEATHERMAP_APPID
		});

		const url = `${OPENWEATHERMAP_BASE_URL}?${forecastParams.toString()}`;

		const forecastResponse = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
		forecastData = await forecastResponse.json();
		const forecastDataParsed = ForecastResponse.safeParse(forecastData);
		if (!forecastDataParsed.success) {
			return json(
				{
					error: 'Unexpected response from forecast provider'
				},
				{ status: 424 }
			);
		}
		cache.set(cacheKey, forecastData, 60 * 5);
	}

	return json(forecastData);
}
