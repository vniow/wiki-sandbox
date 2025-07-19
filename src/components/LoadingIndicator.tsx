// ...existing imports...

/**
 * Props for LoadingIndicator component.
 */
interface LoadingIndicatorProps {
	/** Optional loading message to display. */
	message?: string;
}

/**
 * Displays a loading indicator with an optional message.
 */
export default function LoadingIndicator({ message }: LoadingIndicatorProps) {
	if (!message) return null;
	return (
		<div className='p-2 text-center text-sm text-gray-700 dark:text-gray-300'>
			{message}
		</div>
	);
}
