// Placeholder for image utilities
/**
 * Converts a File to a Base64-encoded string without the data URL prefix.
 */
export function toBase64(file: File): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result;
			if (typeof result === 'string') {
				// Strip off the data URL prefix
				const base64 = result.split(',')[1];
				resolve(base64);
			} else {
				reject(new Error('failed to read file as base64'));
			}
		};
		reader.onerror = () => reject(new Error('failed to read file as base64'));
		reader.readAsDataURL(file);
	});
}
