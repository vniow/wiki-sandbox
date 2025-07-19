// ...existing imports...
import type { Suggestion, WikipediaArticle } from '../utils/api';
import SectionHeader from './SectionHeader';

interface SuggestionsListProps {
	suggestions: Suggestion[];
	wikiRawResponses: WikipediaArticle[][];
	wikiLoading: boolean;
	wikiError: string | null;
}

/**
 * Renders a list of plant suggestions and corresponding Wikipedia links.
 * @param suggestions Array of plant suggestions.
 * @param wikiRawResponses Nested arrays of WikipediaArticle responses.
 * @param wikiLoading Loading state for Wikipedia fetch.
 * @param wikiError Error message for Wikipedia fetch.
 */
export default function SuggestionsList({
	suggestions,
	wikiRawResponses,
	wikiLoading,
	wikiError,
}: SuggestionsListProps) {
	if (suggestions.length === 0) return null;

	// Step 1: Detect browser language
	const browserLang =
		typeof navigator !== 'undefined'
			? (
					navigator.language ||
					(navigator.languages && navigator.languages[0]) ||
					'en'
			  ).toLowerCase()
			: 'en';
	const baseLang = browserLang.split('-')[0];

	return (
		<div
			className='rounded-xl shadow-lg p-6'
			style={{ background: 'var(--gradient-card-3)' }}
		>
			<SectionHeader>Plant suggestions</SectionHeader>
			{wikiError && (
				<div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
					<p className='text-red-700 dark:text-red-400 text-sm'>
						error loading Wikipedia links: {wikiError}
					</p>
				</div>
			)}
			<div className='space-y-4'>
				{suggestions.map((s, idx) => {
					// Step 2: Filter articles by browser language with fallback
					const allArticles = wikiRawResponses[idx] || [];
					// Only include articles with a Wikipedia URL
					const isWikipediaUrl = (url?: string) =>
						typeof url === 'string' && /wikipedia\.org\/wiki\//.test(url);

					let articles = allArticles.filter(
						(article) =>
							article.in_language &&
							typeof article.in_language.identifier === 'string' &&
							article.in_language.identifier.toLowerCase() === browserLang &&
							isWikipediaUrl(article.url)
					);
					// Fallback to base language if no match
					if (articles.length === 0 && baseLang !== browserLang) {
						articles = allArticles.filter(
							(article) =>
								article.in_language &&
								typeof article.in_language.identifier === 'string' &&
								article.in_language.identifier.toLowerCase() === baseLang &&
								isWikipediaUrl(article.url)
						);
					}
					return (
						<div
							key={s.id}
							className='bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600'
						>
							<h3 className='font-semibold text-slate-900 dark:text-slate-100 mb-2'>
								{s.plant_name}
							</h3>
							{wikiLoading ? (
								<p className='text-sm text-slate-500 dark:text-slate-400'>
									stand by... loading Wikipedia links...
								</p>
							) : (
								<div className='space-y-1'>
									{articles.length > 0 ? (
										articles.map((article, aidx) => (
											<div
												key={aidx}
												className='flex items-center gap-3 mb-2'
											>
												{/* Preview image */}
												{article.image && article.image.content_url ? (
													<img
														src={article.image.content_url}
														alt={article.name || 'preview'}
														className='w-12 h-12 object-cover rounded border border-slate-300 dark:border-slate-600 mr-2'
													/>
												) : (
													<div className='w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600 mr-2 flex items-center justify-center text-xs text-slate-400'>
														no image
													</div>
												)}
												<div className='flex flex-col'>
													<a
														href={article.url}
														target='_blank'
														rel='noopener noreferrer'
														className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm hover:underline'
													>
														{article.name || article.url}
													</a>
													{/* Language */}
													{article.in_language &&
														article.in_language.identifier && (
															<span className='text-xs text-slate-500 dark:text-slate-400'>
																Language: {article.in_language.identifier}
															</span>
														)}
												</div>
											</div>
										))
									) : (
										<p className='text-sm text-slate-500 dark:text-slate-400'>
											no Wikipedia links found for your language ({browserLang}
											{baseLang !== browserLang
												? `, fallback: ${baseLang}`
												: ''}
											)
										</p>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
