import { z } from 'zod';

export interface HTMLDivElement_
	extends Omit<HTMLDivElement, 'autocapitalize' | 'dir' | 'style' | 'popover' | 'popover'> {}

export type SkyconsIcon =
	| 'CLEAR_DAY'
	| 'CLEAR_NIGHT'
	| 'PARTLY_CLOUDY_DAY'
	| 'PARTLY_CLOUDY_NIGHT'
	| 'CLOUDY'
	| 'RAIN'
	| 'SHOWERS_DAY'
	| 'SHOWERS_NIGHT'
	| 'SLEET'
	| 'RAIN_SNOW'
	| 'RAIN_SNOW_SHOWERS_DAY'
	| 'RAIN_SNOW_SHOWERS_NIGHT'
	| 'SNOW'
	| 'SNOW_SHOWERS_DAY'
	| 'SNOW_SHOWERS_NIGHT'
	| 'WIND'
	| 'FOG'
	| 'THUNDER'
	| 'THUNDER_RAIN'
	| 'THUNDER_SHOWERS_DAY'
	| 'THUNDER_SHOWERS_NIGHT'
	| 'HAIL';

export const Latitude = z.coerce
	.number()
	.min(-90, 'Latitude must be between -90 and 90 degrees')
	.max(90, 'Latitude must be between -90 and 90 degrees')
	.refine((val) => !isNaN(val), 'Latitude must be a valid number');

export const Longitude = z.coerce
	.number()
	.min(-180, 'Longitude must be between -180 and 180 degrees')
	.max(180, 'Longitude must be between -180 and 180 degrees')
	.refine((val) => !isNaN(val), 'Longitude must be a valid number');

export const ForecastUnits = z
	.literal('metric', {
		errorMap: () => ({ message: "Invalid input. Allowed values are: 'metric' or 'imperial'" })
	})
	.or(
		z.literal('imperial', {
			errorMap: () => ({ message: "Invalid input. Allowed values are: 'metric' or 'imperial'" })
		})
	);

export const ForecastBase = z.object({
	dt: z.number(),
	temp: z.number(),
	feels_like: z.number(),
	pressure: z.number(),
	humidity: z.number(),
	dew_point: z.number(),
	uvi: z.number(),
	clouds: z.number(),
	wind_speed: z.number(),
	wind_deg: z.number(),
	wind_gust: z.number().optional(),
	rain: z.object({ '1h': z.number() }).optional(),
	snow: z.object({ '1h': z.number() }).optional()
});

export const ForecastSummary = z.object({
	id: z.number(),
	main: z.string(),
	description: z.string(),
	icon: z.string() // TODO
});

export const ForecastCurrent = ForecastBase.extend({
	visibility: z.number().optional(),
	sunrise: z.number().optional(),
	sunset: z.number().optional(),
	weather: z.array(ForecastSummary)
});

export const ForecastAlert = z.object({
	sender_name: z.string(),
	event: z.string(),
	start: z.number(),
	end: z.number(),
	description: z.string(),
	tags: z.array(z.string())
});

export const ForecastMinutely = z.object({
	dt: z.number(),
	precipitation: z.number()
});

export const ForecastHourly = ForecastBase.extend({
	weather: z.array(ForecastSummary),
	visibility: z.number().optional(),
	pop: z.number()
});

export const ForecastDaily = ForecastBase.extend({
	sunrise: z.number(),
	sunset: z.number(),
	moonrise: z.number(),
	moonset: z.number(),
	moon_phase: z.number(),
	pop: z.number(),
	weather: z.array(ForecastSummary),
	temp: z.object({
		morn: z.number(),
		day: z.number(),
		eve: z.number(),
		night: z.number(),
		min: z.number(),
		max: z.number()
	}),
	feels_like: z.object({
		morn: z.number(),
		day: z.number(),
		eve: z.number(),
		night: z.number()
	}),
	rain: z.number().optional(),
	snow: z.number().optional()
});

export const ForecastResponse = z.object({
	lat: z.number(),
	lon: z.number(),
	timezone: z.string(),
	timezone_offset: z.number(),
	current: ForecastCurrent,
	minutely: z.array(ForecastMinutely).optional(),
	hourly: z.array(ForecastHourly),
	daily: z.array(ForecastDaily),
	alerts: z.array(ForecastAlert).optional()
});

export const GeosearchResponse = z.object({
	place_id: z.number(),
	licence: z.string(),
	osm_type: z.string(),
	osm_id: z.number(),
	boundingbox: z.array(z.string()),
	lat: z.string(),
	lon: z.string(),
	display_name: z.string(),
	category: z.string(),
	type: z.string(),
	importance: z.number(),
	place_rank: z.number(),
	icon: z.string().optional()
});

export const GeosearchReverseResponse = GeosearchResponse.extend({
	category: z.string(),
	addresstype: z.string(),
	name: z.string().or(z.null())
});

export const AiDaysSummary = z.array(z.object({ summary: z.string() }));
