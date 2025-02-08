import { z } from 'zod';
import { LocalStorage } from './localStorage.svelte';
import { ForecastUnits } from './types';

export const stateForecastUnits = new LocalStorage<z.infer<typeof ForecastUnits> | ''>(
	'forecast-units'
);

export function switchStateForecastUnits() {
	stateForecastUnits.current = stateForecastUnits.current == 'metric' ? 'imperial' : 'metric';
}
