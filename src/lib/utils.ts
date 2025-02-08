import clearDay from '$lib/assets/clearDay.jpg?enhanced';
import clearNight from '$lib/assets/clearNight.jpg?enhanced';
import partlyCloudyDay from '$lib/assets/partlyCloudyDay.jpg?enhanced';
import partlyCloudyNight from '$lib/assets/partlyCloudyNight.jpg?enhanced';
import cloudyDay from '$lib/assets/cloudyDay.jpg?enhanced';
import cloudyNight from '$lib/assets/cloudyNight.jpg?enhanced';
import rainDay from '$lib/assets/rainDay.jpg?enhanced';
import rainNight from '$lib/assets/rainNight.jpg?enhanced';
import thunderDay from '$lib/assets/thunderDay.jpg?enhanced';
import thunderNight from '$lib/assets/thunderNight.jpg?enhanced';
import snowDay from '$lib/assets/snowDay.jpg?enhanced';
import snowNight from '$lib/assets/snowNight.jpg?enhanced';
import fogDay from '$lib/assets/fogDay.jpg?enhanced';
import fogNight from '$lib/assets/fogNight.jpg?enhanced';
import type { SkyconsIcon } from './types';
import type { z } from 'zod';
import { tick } from 'svelte';

export function getBackgroundImage(icon: string) {
	switch (icon) {
		case '01d':
			return clearDay;
		case '01n':
			return clearNight;
		case '02d':
			return partlyCloudyDay;
		case '02n':
			return partlyCloudyNight;
		case '03d':
			return partlyCloudyDay;
		case '03n':
			return partlyCloudyNight;
		case '04d':
			return cloudyDay;
		case '04n':
			return cloudyNight;
		case '09d':
			return rainDay;
		case '09n':
			return rainNight;
		case '10d':
			return rainDay;
		case '10n':
			return rainNight;
		case '11d':
			return thunderDay;
		case '11n':
			return thunderNight;
		case '13d':
			return snowDay;
		case '13n':
			return snowNight;
		case '50d':
			return fogDay;
		case '50n':
			return fogNight;
		default:
			return clearDay;
	}
}

/** Returns react-skycons-extended component for open weather map icon
 * // https://openweathermap.org/weather-conditions
 */
export function getSkyconsIconForOmwIcon(icon: string): SkyconsIcon {
	switch (icon) {
		case '01d':
			return 'CLEAR_DAY';
		case '01n':
			return 'CLEAR_NIGHT';
		case '02d':
			return 'PARTLY_CLOUDY_DAY';
		case '02n':
			return 'PARTLY_CLOUDY_NIGHT';
		case '03d':
			return 'PARTLY_CLOUDY_DAY';
		case '03n':
			return 'PARTLY_CLOUDY_NIGHT';
		case '04d':
			return 'CLOUDY';
		case '04n':
			return 'CLOUDY';
		case '09d':
			return 'RAIN';
		case '09n':
			return 'RAIN';
		case '10d':
			return 'RAIN';
		case '10n':
			return 'RAIN';
		case '11d':
			return 'THUNDER_RAIN';
		case '11n':
			return 'THUNDER_RAIN';
		case '13d':
			return 'SNOW';
		case '13n':
			return 'SNOW';
		case '50d':
			return 'FOG';
		case '50n':
			return 'FOG';
		default:
			return 'CLEAR_DAY';
	}
}

export function zodSafeParseErrorToResponse(zObj: z.SafeParseError<any>) {
	return zObj.error.errors.map((err) => ({
		field: err.path.join('.'),
		message: err.message
	}));
}

export function zodErrorToResponse(zError: z.ZodError<any>) {
	return zError.issues.map((issue) => ({
		field: issue.path.join('.'),
		message: issue.message
	}));
}
