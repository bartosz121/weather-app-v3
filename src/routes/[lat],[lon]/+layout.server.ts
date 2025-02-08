import {
	ForecastResponse,
	ForecastUnits,
	Latitude,
	Longitude,
	GeosearchReverseResponse,
	GeosearchResponse,
	AiDaysSummary
} from '$lib/types.js';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { GOOGLE_AI_API_KEY } from '$env/static/private';
import { blake2sHex } from 'blakejs';
import { cache } from '$lib/cache.js';

function guessUnits(lat: number, lon: number): z.infer<typeof ForecastUnits> {
	const isUS = lat >= 24.396308 && lat <= 49.384358 && lon >= -125.0 && lon <= -66.93457;
	const isHawaii = lat >= 18.86546 && lat <= 28.5175 && lon >= -178.443593 && lon <= -154.755792;
	const isVirginIslands =
		lat >= 17.623467 && lat <= 18.412861 && lon >= -65.159094 && lon <= -64.512674;
	const isGuam = lat >= 13.234444 && lat <= 13.654722 && lon >= 144.624167 && lon <= 144.956389;
	const isMyanmar = lat >= 9.93296 && lat <= 28.54789 && lon >= 92.18987 && lon <= 101.17027;
	const isLiberia = lat >= 4.20826 && lat <= 8.55199 && lon >= -11.49752 && lon <= -7.36732;

	if (isUS || isHawaii || isVirginIslands || isGuam || isMyanmar || isLiberia) {
		return 'imperial';
	}

	return 'metric';
}

const PROMPT = `
You are a weather forecaster summarizing a 8-day weather forecast. I will provide JSON data containing daily weather details. Your task is to generate a concise, natural-language weather summary for each day, similar to what a TV weather presenter would say.

### **Instructions:**
- **Output Format:** Return a JSON array with exactly 8 objects, with 'summary' key where value of type string with summary of the weather for one day.
- **Style:** The summaries should be clear, engaging, and informative.
- **Content:**
  - Use the 'summary' field for inspiration.
  - Randomly, include some extra information about sunrise, sunset, moonrise, moonset or moon phase
  - Mention key details such as temperature trends, precipitation, wind conditions, and notable weather events.
  - Avoid excessive numerical details—use general terms like "chilly," "breezy," "warm," or "heavy snowfall."
  - **Randomly include** information about **sunrise, sunset, moonrise, moonset, or moon phase** in some summaries for variety.
  - **Always mention** if it is a full moon ('moon_phase = 0.5').
  - **Always mention** if it is a new moon ('moon_phase = 1') or ('moon_phase = 0').
  - **Never** use 'dt' value as unix timestamp directly in your day summary
  - **Never** use 'sunrise', 'sunset', 'moonrise', 'moonset' value as unix timestamp directly in your day summary
  - **Never** use 'moon_phase' numerical value directly in your day summary
  - If applicable, mention times of day when weather conditions may change (e.g., "Snow showers in the morning, clearing by afternoon").
  - Use the following JSON schema as your response:
  {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "array",
  "items": [
    {
      "type": "object",
      "properties": {
        "summary": {
          "type": "string"
        }
      },
      "required": [
        "summary"
      ]
    }
  ]
}

- **Example Output:**
[
	{
		"summary": "A cold and snowy day ahead with light snow showers expected throughout. Highs around 2°C, with brisk winds making it feel even colder."
	},
	{
		"summary": "A mix of sun and clouds with a chance of light rain in the evening. Temperatures staying near seasonal averages."
	},
	{
		"summary": "Mostly clear skies and dry conditions, but it will feel chilly with lows dropping below freezing overnight."
	}
]

  ---
Provide only the JSON array in your response, with no additional text and no markdown formatting, just pure json.
Forecast data below:\n
`;

const aiResponseSchema = {
	type: SchemaType.ARRAY,
	items: {
		type: SchemaType.OBJECT,
		properties: {
			summary: {
				type: SchemaType.STRING,
				description: 'concise, natural-language weather summary',
				nullable: false
			}
		},
		required: ['summary']
	}
};

const genAi = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
const model = genAi.getGenerativeModel({
	model: 'gemini-1.5-flash',
	generationConfig: { responseMimeType: 'application/json', responseSchema: aiResponseSchema }
});

interface LoadResponse {
	forecast: z.infer<typeof ForecastResponse>;
	aiDaysSummary: z.infer<typeof AiDaysSummary> | null;
	reverseGeosearch: z.infer<typeof GeosearchResponse> | null;
	units: z.infer<typeof ForecastUnits>;
}

export async function load({ fetch, params, depends, url, cookies }) {
	async function getData(): Promise<LoadResponse> {
		return new Promise(async (resolve, reject) => {
			try {
				const lat = Latitude.safeParse(params.lat);
				const lon = Longitude.safeParse(params.lon);
				if (!lat.success || !lon.success) {
					// TODO: show some kind of notification
					redirect(302, '/');
				}

				const units =
					ForecastUnits.safeParse(url.searchParams.get('units')).data ??
					guessUnits(lat.data, lon.data);

				const reverseGeosearchParams = new URLSearchParams({
					lat: lat.data.toString(),
					lon: lon.data.toString()
				});

				const [forecastResponse, reverseGeosearchResponse] = await Promise.all([
					fetch('/api/forecast', {
						method: 'POST',
						body: JSON.stringify({ lat: lat.data, lon: lon.data, units: units })
					}),
					fetch(`/api/geosearch/reverse?${reverseGeosearchParams.toString()}`)
				]);

				if (!forecastResponse.ok) {
					console.error('foreacst response not ok'); // TODO:
					error(422, 'Error getting forecast data');
				}

				const forecastParsed = ForecastResponse.safeParse(await forecastResponse.json());
				if (!forecastParsed.success) {
					console.error(forecastParsed.error);
					error(422, 'Unexpected forecast data'); // TODO:
				}

				const stringifiedDailyData = JSON.stringify(forecastParsed.data.daily);
				const summaryPrompt =
					PROMPT +
					stringifiedDailyData +
					'.\nIf you want to use units in your summary use ' +
					units +
					' units.';

				const aiSummaryCacheKey = blake2sHex(units + stringifiedDailyData);

				let aiDaysSummary: z.infer<typeof AiDaysSummary> | null = cache.get(aiSummaryCacheKey);

				try {
					if (aiDaysSummary === null) {
						const aiDaysSummaryResponse = await model.generateContent(summaryPrompt, {
							timeout: 10 * 1000
						});

						const aiDaysSummaryJsonParsed = JSON.parse(aiDaysSummaryResponse.response.text());
						const aiDaysSummaryParsed = AiDaysSummary.safeParse(aiDaysSummaryJsonParsed);

						if (aiDaysSummaryParsed.success) {
							aiDaysSummary = aiDaysSummaryParsed.data;
						}
						cache.set(aiSummaryCacheKey, aiDaysSummary, 60 * 5);
					}
				} catch (e) {
					console.error(`Error fetching ai summary: ${e}`);
				}

				let reverseGeoserachData: z.infer<typeof GeosearchResponse> | null = null;

				if (reverseGeosearchResponse.ok) {
					const reverseGeosearchParsed = GeosearchReverseResponse.safeParse(
						await reverseGeosearchResponse.json()
					);
					if (reverseGeosearchParsed.success) {
						reverseGeoserachData = reverseGeosearchParsed.data;
					}
				}

				resolve({
					forecast: forecastParsed.data,
					aiDaysSummary: aiDaysSummary,
					reverseGeosearch: reverseGeoserachData,
					units: units
				});
			} catch (e) {
				reject();
			}
		});
	}
	return { loadData: getData() };
}
