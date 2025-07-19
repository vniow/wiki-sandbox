import SectionHeader from './SectionHeader';

/**
 * Displays a preview of the selected image.
 * @param url The object URL of the selected image, or null to hide.
 */
interface ImagePreviewProps {
	url: string | null;
}

export default function ImagePreview({ url }: ImagePreviewProps) {
	if (!url) return null;
	return (
		<div className='mt-6'>
			<SectionHeader>Image preview</SectionHeader>
			<div className='w-full max-w-md mx-auto aspect-square bg-background dark:bg-surface-alt rounded-lg overflow-hidden border border-surface-alt dark:border-surface'>
				<img
					src={url}
					alt='Selected preview'
					className='w-full h-full object-contain'
				/>
			</div>
		</div>
	);
}
