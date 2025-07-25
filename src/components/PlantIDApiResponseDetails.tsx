import { useState } from 'react';
import SectionHeader from './SectionHeader';
import type { PlantIdApiResponse } from '../utils/api';

interface PlantIDApiResponseDetailsProps {
	data: PlantIdApiResponse | null;
}

/**
 * Displays detailed JSON response from Plant.id API.
 * @param data The PlantIdApiResponse object or null.
 */
export default function PlantIDApiResponseDetails({
	data,
}: PlantIDApiResponseDetailsProps) {
	const [expanded, setExpanded] = useState(false);
	if (!data) return null;
	return (
		<div
			className='rounded-xl shadow-lg mb-6'
			style={{ background: 'var(--gradient-card-2)' }}
		>
			<div
				className='flex items-center justify-between p-4 cursor-pointer hover:bg-secondary transition-colors'
				onClick={() => setExpanded(!expanded)}
			>
				<SectionHeader>Plant.id API response</SectionHeader>
				<button
					className='text-sm text-primary hover:text-surface font-medium'
					onClick={(e) => {
						e.stopPropagation();
						setExpanded(!expanded);
					}}
				>
					{expanded ? 'Hide' : 'Show'}
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
