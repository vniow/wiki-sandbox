import { useState } from 'react';
import SectionHeader from './SectionHeader';
import type { WikipediaArticle } from '../utils/api';

interface WikiApiResponseDetailsProps {
	data: WikipediaArticle[][];
}

/**
 * Displays detailed JSON response from Wikimedia API.
 * @param data The Wikimedia API response (array of arrays of WikipediaArticle).
 */
export default function WikiApiResponseDetails({
	data,
}: WikiApiResponseDetailsProps) {
	const [expanded, setExpanded] = useState(false);
	if (!data || data.length === 0) return null;
	return (
		<div
			className='rounded-xl shadow-lg mb-6 overflow-hidden'
			style={{ background: 'var(--gradient-card-4)' }}
		>
			<div
				className='flex items-center justify-between p-4 cursor-pointer hover:bg-secondary transition-colors'
				onClick={() => setExpanded(!expanded)}
			>
				<SectionHeader>Wikimedia API response</SectionHeader>
				<button
					className='text-sm text-primary hover:text-surface font-medium'
					onClick={(e) => {
						e.stopPropagation();
						setExpanded(!expanded);
					}}
				>
					{expanded ? 'hide' : 'show'}
				</button>
			</div>
			{expanded && (
				<div className='border-t border-surface-alt max-h-64 overflow-y-auto p-4 bg-background'>
					<pre className='whitespace-pre-wrap break-words text-xs text-surface font-mono'>
						{JSON.stringify(data, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}
