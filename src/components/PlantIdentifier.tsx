import React, { useState } from 'react';
import type { ChangeEvent } from 'react';

interface Suggestion {
	id: string;
	plant_name: string;
}

interface PlantIdApiResponse {
	suggestions: Suggestion[];
	[key: string]: unknown;
}

interface WikipediaArticle {
	name: string;
	identifier: number;
	abstract: string;
	date_modified: string;
	version?: {
		identifier: number;
		tags?: string[];
		scores?: object;
		editor?: object;
		number_of_characters?: number;
		size?: { value: number; unit_text: string };
	};
	url?: string;
	namespace?: { identifier: number };
	in_language?: { identifier: string };
	main_entity?: { identifier: string; url: string };
	additional_entities?: object[];
	categories?: object[];
	templates?: object[];
	redirects?: object[];
	is_part_of?: { identifier: string; url: string };
	article_body?: object;
	license?: object[];
	event?: object;
	image?: { content_url: string; width: number; height: number };
}

const PlantIdentifier: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [apiResult, setApiResult] = useState<PlantIdApiResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [wikiRawResponses, setWikiRawResponses] = useState<
		WikipediaArticle[][]
	>([]);
	const [wikiLoading, setWikiLoading] = useState(false);
	const [wikiError, setWikiError] = useState<string | null>(null);
	const [debugMode, setDebugMode] = useState(false);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		console.debug('[PlantIdentifier] File input changed:', file);
		if (!file) {
			setSelectedFile(null);
			setPreviewUrl(null);
			setError(null);
			console.debug('[PlantIdentifier] No file selected.');
			return;
		}
		if (!file.type.startsWith('image/')) {
			setSelectedFile(null);
			setPreviewUrl(null);
			setError('Only image files are accepted.');
			return;
		}
		setSelectedFile(file);
		setPreviewUrl(URL.createObjectURL(file));
		setError(null);
		console.debug(
			'[PlantIdentifier] Image file accepted:',
			file.name,
			file.type,
			file.size
		);
	};

	// Step 2: Query Wikimedia Enterprise On-Demand API for Wikipedia article URLs
	const fetchWikipediaUrls = async (plantNames: string[]) => {
		setWikiLoading(true);
		setWikiRawResponses([]);
		setWikiError(null);
		try {
			const wikiApiKey = import.meta.env.VITE_WIKI_API_KEY;
			const rawResponses: WikipediaArticle[][] = [];
			// Detect browser language, fallback to 'en' if not available
			const browserLang = (navigator.language || 'en').split('-')[0];
			for (const name of plantNames) {
				const response = await fetch(
					`https://api.enterprise.wikimedia.com/v2/articles/${encodeURIComponent(
						name
					)}?filters[language]=${browserLang}`,
					{
						headers: { Authorization: `Bearer ${wikiApiKey}` },
					}
				);
				if (response.ok) {
					const data = await response.json();
					// Wikimedia API returns an array of articles or an object; normalize to array
					if (Array.isArray(data)) {
						rawResponses.push(data as WikipediaArticle[]);
					} else if (data && typeof data === 'object') {
						rawResponses.push([data as WikipediaArticle]);
					} else {
						rawResponses.push([]);
					}
					console.debug(
						'[PlantIdentifier] Wikipedia API response for',
						name,
						':',
						data
					);
				} else {
					rawResponses.push([]);
					console.warn('[PlantIdentifier] Wikipedia API not found for:', name);
				}
			}
			setWikiRawResponses(rawResponses);
		} catch (err) {
			setWikiError('Failed to fetch Wikipedia links.');
			setWikiRawResponses([]);
			console.error('[PlantIdentifier] Error fetching Wikipedia URLs:', err);
		} finally {
			setWikiLoading(false);
		}
	};

	// Top-level handleIdentify function
	const handleIdentify = async () => {
		if (!selectedFile && !debugMode) {
			setError('Please select an image first.');
			console.warn(
				'[PlantIdentifier] Identify attempted with no image selected.'
			);
			return;
		}
		setLoading(true);
		setError(null);
		setApiResult(null);
		// Removed setWikiUrls
		setWikiError(null);
		console.debug('[PlantIdentifier] Starting plant identification...');
		try {
			let data: PlantIdApiResponse;
			if (debugMode) {
				// Load mock data from local file
				const response = await fetch('/public/sample-response.json');
				if (!response.ok) {
					throw new Error('Failed to load mock data');
				}
				data = await response.json();
				console.debug('[PlantIdentifier] Loaded mock Plant.id response:', data);
			} else {
				const apiKey = import.meta.env.VITE_PLANT_ID_API_KEY;
				console.debug(
					'[PlantIdentifier] API Key:',
					apiKey ? '[REDACTED]' : 'undefined'
				);
				if (!apiKey) {
					setError('API key is not configured.');
					setLoading(false);
					console.error('[PlantIdentifier] API key missing.');
					return;
				}
				// Convert image to Base64
				const toBase64 = (file: File) => {
					return new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => {
							if (typeof reader.result === 'string') {
								resolve(reader.result.split(',')[1]);
							} else {
								reject('Failed to read file as base64');
							}
						};
						reader.onerror = reject;
						reader.readAsDataURL(file);
					});
				};
				console.debug('[PlantIdentifier] Converting image to Base64...');
				const base64Image = await toBase64(selectedFile!);
				console.debug(
					'[PlantIdentifier] Base64 image length:',
					base64Image.length
				);
				// Prepare request body
				const requestBody = {
					images: [base64Image],
					// organs: ['leaf'], // optional, can be omitted or set as needed
				};
				console.debug(
					'[PlantIdentifier] Sending request to API v2:',
					requestBody
				);
				const response = await fetch('https://api.plant.id/v2/identify', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Api-Key': apiKey,
					},
					body: JSON.stringify(requestBody),
				});
				console.debug(
					'[PlantIdentifier] API response status:',
					response.status
				);
				if (!response.ok) {
					const text = await response.text();
					console.error(
						'[PlantIdentifier] API request failed:',
						response.status,
						text
					);
					throw new Error('API request failed: ' + text);
				}
				data = await response.json();
				console.debug('[PlantIdentifier] API response data:', data);
			}
			setApiResult(data);
			// Step 1: Extract all plant names
			const suggestions = data?.suggestions || [];
			if (suggestions.length > 0) {
				await fetchWikipediaUrls(
					suggestions.map((s: Suggestion) => s.plant_name)
				);
			}
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('Unknown error');
			}
			console.error('[PlantIdentifier] Error during identification:', err);
		} finally {
			setLoading(false);
			console.debug('[PlantIdentifier] Identification process finished.');
		}
	};

	return (
		<div>
			<h1>Plant Identifier</h1>
			<label style={{ display: 'block', marginBottom: '1em' }}>
				<input
					type='checkbox'
					checked={debugMode}
					onChange={(e) => setDebugMode(e.target.checked)}
					style={{ marginRight: '0.5em' }}
				/>
				Debug mode (use mock Plant.id response)
			</label>
			<input
				type='file'
				accept='image/*'
				onChange={handleFileChange}
				disabled={debugMode}
			/>
			{error && <p style={{ color: 'red' }}>{error}</p>}
			{previewUrl && !debugMode && (
				<div>
					<h2>Image Preview:</h2>
					<img
						src={previewUrl}
						alt='Preview'
						style={{ maxWidth: '300px', maxHeight: '300px' }}
					/>
				</div>
			)}
			<button
				onClick={handleIdentify}
				disabled={(!selectedFile && !debugMode) || loading}
				style={{ marginTop: '1em' }}
			>
				{loading
					? 'Identifying...'
					: debugMode
					? 'Load Mock Data'
					: 'Identify Plant'}
			</button>
			{apiResult && (
				<div style={{ marginTop: '2em' }}>
					<details>
						<summary
							style={{
								cursor: 'pointer',
								fontWeight: 'bold',
								fontSize: '1.1em',
							}}
						>
							API Response (click to expand/collapse)
						</summary>
						<pre
							style={{
								maxHeight: '300px',
								overflow: 'auto',
								background: 'rgb(61 35 75)',
								padding: '1em',
								borderRadius: '6px',
							}}
						>
							{JSON.stringify(apiResult, null, 2)}
						</pre>
					</details>
					{/* Display all plant names and Wikipedia links */}
					{apiResult.suggestions && apiResult.suggestions.length > 0 && (
						<div style={{ marginTop: '1em' }}>
							<h3>Plant Suggestions:</h3>
							{wikiLoading && <span>Loading Wikipedia links...</span>}
							{wikiError && <span style={{ color: 'red' }}>{wikiError}</span>}
							<ul>
								{apiResult.suggestions.map(
									(suggestion: Suggestion, idx: number) => {
										// Find the correct language article in the raw response
										const raw = wikiRawResponses[idx];
										const browserLang = (navigator.language || 'en').split(
											'-'
										)[0];
										let correctLangArticle = null;
										if (Array.isArray(raw)) {
											correctLangArticle = raw.find(
												(article: WikipediaArticle) =>
													article?.in_language?.identifier === browserLang
											);
										}
										return (
											<li
												key={suggestion.id}
												style={{ marginBottom: '0.5em' }}
											>
												<span>{suggestion.plant_name}</span>
												{correctLangArticle && correctLangArticle.url ? (
													<>
														{' '}
														<a
															href={correctLangArticle.url}
															target='_blank'
															rel='noopener noreferrer'
														>
															View on Wikipedia
														</a>
													</>
												) : (
													<span style={{ color: 'gray' }}>
														{' '}
														(No Wikipedia article found in your language)
													</span>
												)}
												{/* Collapsible Wikipedia API response for this suggestion */}
												{raw && (
													<details style={{ marginTop: '0.5em' }}>
														<summary
															style={{
																cursor: 'pointer',
																fontWeight: 'bold',
																fontSize: '0.95em',
															}}
														>
															Wikipedia API Response (click to expand/collapse)
														</summary>
														<pre
															style={{
																maxHeight: '200px',
																overflow: 'auto',
																background: 'rgb(61 35 75)',
																padding: '0.5em',
																borderRadius: '6px',
															}}
														>
															{JSON.stringify(raw, null, 2)}
														</pre>
													</details>
												)}
											</li>
										);
									}
								)}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default PlantIdentifier;
