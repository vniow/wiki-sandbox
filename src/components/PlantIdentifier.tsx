import { useState } from 'react';
import FileInput from './FileInput';
import ImagePreview from './ImagePreview';
import DebugToggle from './DebugToggle';
import SuggestionsList from './SuggestionsList';
import ApiResponseDetails from './ApiResponseDetails';
import WikiApiResponseDetails from './WikiApiResponseDetails';
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from './LoadingIndicator';
import { identifyPlant, fetchWikipediaUrls } from '../utils/api';
import type {
	Suggestion,
	PlantIdApiResponse,
	WikipediaArticle,
} from '../utils/api';
import SectionHeader from './SectionHeader';

function PlantIdentifier() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [apiResult, setApiResult] = useState<PlantIdApiResponse | null>(null);
	const [loading, setLoading] = useState(false);
	const [wikiRawResponses, setWikiRawResponses] = useState<
		WikipediaArticle[][]
	>([]);
	const [wikiLoading, setWikiLoading] = useState(false);
	const [wikiError, setWikiError] = useState<string | null>(null);
	const [debugMode, setDebugMode] = useState(false);

	const handleFileChange = (file: File | null) => {
		if (!file) {
			setSelectedFile(null);
			setPreviewUrl(null);
			setError(null);
			return;
		}
		if (!file.type.startsWith('image/')) {
			setSelectedFile(null);
			setPreviewUrl(null);
			setError('excuse me, only image files are accepted');
			return;
		}
		setSelectedFile(file);
		setPreviewUrl(URL.createObjectURL(file));
		setError(null);
	};

	const handleIdentify = async () => {
		if (!selectedFile && !debugMode) {
			setError('please select an image first');
			return;
		}
		setLoading(true);
		setError(null);
		setApiResult(null);
		setWikiError(null);
		try {
			const result = await identifyPlant(selectedFile!, debugMode);
			setApiResult(result);
			if (result.suggestions.length > 0) {
				setWikiLoading(true);
				const wikiData = await fetchWikipediaUrls(
					result.suggestions.map((s: Suggestion) => s.plant_name)
				);
				setWikiRawResponses(wikiData);
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : 'unknown error');
			setWikiRawResponses([]);
		} finally {
			setLoading(false);
			setWikiLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-background dark:bg-surface-alt py-8'>
			<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='text-center mb-8'>
					<SectionHeader className='text-2xl font-bold'>
						ID that plant!
					</SectionHeader>
				</div>
				<div
					className='rounded-xl shadow-lg p-6 mb-6'
					style={{ background: 'var(--gradient-card-1)' }}
				>
					<FileInput
						onFileChange={handleFileChange}
						disabled={loading || wikiLoading}
					/>
					<ImagePreview url={previewUrl} />
					<button
						className='mt-6 px-6 py-3 bg-primary hover:bg-accent text-white font-medium rounded-lg transition-colors duration-200 disabled:bg-surface-alt disabled:cursor-not-allowed'
						onClick={handleIdentify}
						disabled={loading || wikiLoading}
					>
						{debugMode ? 'load mock data' : 'ID that plant!'}
					</button>
					<DebugToggle
						debugMode={debugMode}
						setDebugMode={setDebugMode}
					/>
					<ErrorMessage message={error} />
					<LoadingIndicator
						message={
							loading
								? 'identifying...'
								: wikiLoading
								? 'loading Wikipedia links...'
								: undefined
						}
					/>
				</div>
				<ApiResponseDetails data={apiResult} />
				<WikiApiResponseDetails data={wikiRawResponses} />
				<SuggestionsList
					suggestions={apiResult?.suggestions || []}
					wikiRawResponses={wikiRawResponses}
					wikiLoading={wikiLoading}
					wikiError={wikiError}
				/>
			</div>
		</div>
	);
}
export default PlantIdentifier;
