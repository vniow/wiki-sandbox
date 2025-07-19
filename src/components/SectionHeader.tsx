import React from 'react';

interface SectionHeaderProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * Consistent section header for all major components.
 */
export default function SectionHeader({
	children,
	className = '',
}: SectionHeaderProps) {
	return (
		<h2
			className={`text-xl sm:text-2xl font-bold mb-3 text-slate-100 tracking-tight ${className}`.trim()}
		>
			{children}
		</h2>
	);
}
