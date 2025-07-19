// Placeholder for API utilities
import { toBase64 } from './imageUtils';
import { getBrowserLanguage } from './languageUtils';

// Wikimedia token management (in-memory for client-side; use secure storage for SSR)
let wikiAccessToken = import.meta.env.VITE_WIKI_API_KEY;
const wikiRefreshToken = import.meta.env.VITE_WIKI_REFRESH_TOKEN;
let wikiTokenExpiry: number | null = null; // Unix timestamp in seconds

/**
 * Refreshes Wikimedia access token using the refresh token and username
 */
export async function refreshWikiAccessToken(): Promise<void> {
	const username = import.meta.env.VITE_WIKI_USERNAME || 'vniow'; // Set your username in env if needed
	const res = await fetch(
		'https://auth.enterprise.wikimedia.com/v1/token-refresh',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, refresh_token: wikiRefreshToken }),
		}
	);
	if (!res.ok) {
		throw new Error('failed to refresh Wikimedia access token');
	}
	const data = await res.json();
	wikiAccessToken = data.access_token;
	wikiTokenExpiry = Math.floor(Date.now() / 1000) + (data.expires_in || 86400); // Default 24h expiry
}

export interface Suggestion {
	id: string;
	plant_name: string;
}

export interface PlantIdApiResponse {
	suggestions: Suggestion[];
	[key: string]: unknown;
}

export interface WikipediaArticle {
	name: string;
	url?: string;
	in_language?: { identifier: string };
	image?: {
		content_url?: string;
		width?: number;
		height?: number;
	};
	[key: string]: unknown;
}

/**
 * Identifies a plant from an image file using Plant.id API
 */
export async function identifyPlant(
	file: File,
	debugMode = false
): Promise<PlantIdApiResponse> {
	if (debugMode) {
		const response = await fetch('/sample-plantid-response.json');
		if (!response.ok) throw new Error('failed to load mock data');
		return response.json();
	}
	const apiKey = import.meta.env.VITE_PLANT_ID_API_KEY;
	if (!apiKey) throw new Error('API key is not configured');
	const base64Image = await toBase64(file);
	const body = { images: [base64Image] };
	const res = await fetch('https://api.plant.id/v2/identify', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Api-Key': apiKey,
		},
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error('Plant.id API request failed: ' + text);
	}
	return res.json();
}

/**
 * Fetches Wikipedia articles from Wikimedia Enterprise On-Demand API
 */
export async function fetchWikipediaUrls(
	plantNames: string[]
): Promise<WikipediaArticle[][]> {
	const browserLang = getBrowserLanguage();
	const rawResponses: WikipediaArticle[][] = [];
	// Check expiry and refresh if needed
	if (wikiTokenExpiry && Math.floor(Date.now() / 1000) > wikiTokenExpiry - 60) {
		await refreshWikiAccessToken();
	}
	for (const name of plantNames) {
		let res = await fetch(
			`https://api.enterprise.wikimedia.com/v2/articles/${encodeURIComponent(
				name
			)}?filters[language]=${browserLang}`,
			{ headers: { Authorization: `Bearer ${wikiAccessToken}` } }
		);
		// If unauthorized, try refreshing token and retry once
		if (res.status === 401) {
			await refreshWikiAccessToken();
			res = await fetch(
				`https://api.enterprise.wikimedia.com/v2/articles/${encodeURIComponent(
					name
				)}?filters[language]=${browserLang}`,
				{ headers: { Authorization: `Bearer ${wikiAccessToken}` } }
			);
		}
		if (res.ok) {
			const data = await res.json();
			rawResponses.push(Array.isArray(data) ? data : [data]);
		} else {
			rawResponses.push([]);
		}
	}
	return rawResponses;
}
