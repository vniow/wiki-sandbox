import type { Dispatch, SetStateAction } from 'react';
import SectionHeader from './SectionHeader';

interface DebugToggleProps {
	/** Whether debug mode is active */
	debugMode: boolean;
	/** Function to update debug mode state */
	setDebugMode: Dispatch<SetStateAction<boolean>>;
}

/** Toggle input for enabling or disabling debug mode. */
export default function DebugToggle({
	debugMode,
	setDebugMode,
}: DebugToggleProps) {
	return (
		<div>
			<SectionHeader className='mb-1'>debug mode</SectionHeader>
			<label className='flex items-center mb-6 text-slate-300 cursor-pointer'>
				<input
					type='checkbox'
					checked={debugMode}
					onChange={(e) => setDebugMode(e.target.checked)}
					className='w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 mr-3'
				/>
				<span className='font-medium'>
					use mock Plant.id response
					<br />
					...and avoid using up my Plant.id API quota
				</span>
			</label>
		</div>
	);
}
