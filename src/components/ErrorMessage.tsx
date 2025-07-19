interface ErrorMessageProps {
	/** The error message to display, or null to hide. */
	message: string | null;
}

/**
 * Displays an error message in red text with bottom margin.
 * @param message The error message to display.
 */
export default function ErrorMessage({ message }: ErrorMessageProps) {
	if (!message) return null;
	return <p className='text-red-600 dark:text-red-400 mb-4'>{message}</p>;
}
