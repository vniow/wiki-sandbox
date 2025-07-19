/**
 * Props for FileInput component.
 */
interface FileInputProps {
	/** Callback invoked with the selected File or null. */
	onFileChange: (file: File | null) => void;
	/** Whether the input is disabled. */
	disabled: boolean;
}

/**
 * FileInput component for selecting image files.
 * @param onFileChange Callback invoked with the selected File or null.
 * @param disabled Whether the input is disabled.
 */
export default function FileInput({ onFileChange, disabled }: FileInputProps) {
	return (
		<input
			type='file'
			accept='image/*'
			disabled={disabled}
			onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
			className='block w-full px-3 py-2 border border-surface-alt rounded-lg bg-background text-black focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-background disabled:cursor-not-allowed file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-background file:text-black file:cursor-pointer'
		/>
	);
}
