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
				className='flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors'
				onClick={() => setExpanded(!expanded)}
			>
				<SectionHeader>Wikimedia API response</SectionHeader>
				<button
					className='text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium'
					onClick={(e) => {
						e.stopPropagation();
						setExpanded(!expanded);
					}}
				>
					{expanded ? 'Hide' : 'Show'}
				</button>
			</div>
			{expanded && (
				<div className='border-t border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900'>
					<pre className='whitespace-pre-wrap break-words text-xs text-slate-700 dark:text-slate-300 font-mono'>
						{JSON.stringify(data, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}
