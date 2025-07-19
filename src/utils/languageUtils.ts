// Placeholder for language utilities
/**
 * Returns the browser's primary language code (e.g., 'en'), defaulting to 'en'.
 */
export function getBrowserLanguage(): string {
	const lang = navigator.language || 'en';
	return lang.split('-')[0];
}
