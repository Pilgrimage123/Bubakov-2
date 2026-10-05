import React from 'react';

export interface HruskaIconProps {
	size?: string | number;
	className?: string;
	style?: React.CSSProperties;
	[key: string]: any;
}

export const HruskaIcon: React.FC<HruskaIconProps> = ({
	size = "1.2em",
	className = "",
	style = {},
	...props
}) => {
	const pixelSize = typeof size === 'number' ? `${size}px` : size;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 100 100"
			width={pixelSize}
			height={pixelSize}
			className={className}
			style={{
				display: "inline-block",
				verticalAlign: "middle",
				overflow: "visible",
				...style
			}}
			role="img"
			aria-label="Šťavnatá česká hruška zvedající náladu a doplňující kuráž"
			{...props}
		>
			<defs>
				<radialGradient id="hIconShadow" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor="#26170E" stopOpacity="0.4" />
					<stop offset="70%" stopColor="#26170E" stopOpacity="0.12" />
					<stop offset="100%" stopColor="#26170E" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="hIconGrad" x1="25%" y1="15%" x2="85%" y2="85%">
					<stop offset="0%" stopColor="#D9F99D" />
					<stop offset="25%" stopColor="#EAB308" />
					<stop offset="65%" stopColor="#F59E0B" />
					<stop offset="100%" stopColor="#EA580C" />
				</linearGradient>
				<linearGradient id="hIconLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#84CC16" />
					<stop offset="100%" stopColor="#4D7C0F" />
				</linearGradient>
				<linearGradient id="hIconStem" x1="0%" y1="100%" x2="0%" y2="0%">
					<stop offset="0%" stopColor="#451A03" />
					<stop offset="100%" stopColor="#78350F" />
				</linearGradient>
			</defs>

			{/* Soft ground shadow */}
			<ellipse cx="50" cy="90" rx="26" ry="7" fill="url(#hIconShadow)" />

			{/* Stem */}
			<path
				d="M 49 32 C 48 24, 44 18, 41 13 C 44 12, 47 13, 49 15 C 52 20, 54 26, 53 32 Z"
				fill="url(#hIconStem)"
				stroke="#1E150B"
				strokeWidth="1.8"
				strokeLinejoin="round"
			/>

			{/* Green leaf */}
			<path
				d="M 48 22 C 58 13, 72 16, 76 22 C 72 29, 58 31, 48 22 Z"
				fill="url(#hIconLeaf)"
				stroke="#1E150B"
				strokeWidth="2.2"
				strokeLinejoin="round"
			/>
			<path
				d="M 48 22 Q 62 21 75 22"
				fill="none"
				stroke="#274606"
				strokeWidth="1.6"
				strokeLinecap="round"
			/>

			{/* Pear body */}
			<path
				d="M 50 30 C 42 30, 38 42, 36 50 C 30 58, 22 66, 22 75 C 22 84, 34 89, 50 89 C 66 89, 78 84, 78 75 C 78 66, 70 58, 64 50 C 62 42, 58 30, 50 30 Z"
				fill="url(#hIconGrad)"
				stroke="#1E150B"
				strokeWidth="3.2"
				strokeLinejoin="round"
			/>

			{/* Calyx */}
			<ellipse cx="50" cy="88" rx="2.5" ry="1.2" fill="#3D1D08" stroke="#1E150B" strokeWidth="1" />

			{/* Natural pear freckles */}
			<g fill="#78350F" opacity="0.6">
				<circle cx="58" cy="62" r="1.1" />
				<circle cx="64" cy="69" r="1" />
				<circle cx="54" cy="74" r="1.2" />
				<circle cx="42" cy="78" r="0.9" />
				<circle cx="68" cy="76" r="0.9" />
				<circle cx="46" cy="58" r="0.8" />
				<circle cx="38" cy="68" r="1.1" />
				<circle cx="50" cy="46" r="0.7" />
			</g>

			{/* Highlights */}
			<path
				d="M 33 55 C 28 62, 28 72, 34 78"
				fill="none"
				stroke="#FFFFFF"
				strokeWidth="3.2"
				strokeLinecap="round"
				opacity="0.55"
			/>
			<path
				d="M 40 40 C 38 46, 36 50, 36 53"
				fill="none"
				stroke="#FFFFFF"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.4"
			/>
		</svg>
	);
};
