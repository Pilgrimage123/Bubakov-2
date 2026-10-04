import React from 'react';

export interface KynutyKolacIconProps {
	size?: string | number;
	className?: string;
	style?: React.CSSProperties;
	[key: string]: any;
}

export const KynutyKolacIcon: React.FC<KynutyKolacIconProps> = ({
	size = "1.2em",
	className = "",
	style = {},
	...props
}) => {
	const pixelSize = typeof size === 'number' ? `${size}px` : size;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 200 200"
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
			aria-label="Tradiční český kynutý chodský koláč s tvarohem, povidly a mandlemi"
			{...props}
		>
			<defs>
				<radialGradient id="kkShadow" cx="50%" cy="52%" r="50%">
					<stop offset="70%" stopColor="#1A0D06" stopOpacity="0.32" />
					<stop offset="92%" stopColor="#1A0D06" stopOpacity="0.12" />
					<stop offset="100%" stopColor="#1A0D06" stopOpacity="0" />
				</radialGradient>
				<radialGradient id="kkCrust" cx="42%" cy="40%" r="58%">
					<stop offset="0%" stopColor="#FCD34D" />
					<stop offset="55%" stopColor="#F59E0B" />
					<stop offset="78%" stopColor="#D97706" />
					<stop offset="88%" stopColor="#9A3412" />
					<stop offset="97%" stopColor="#7C2D12" />
					<stop offset="100%" stopColor="#451A03" />
				</radialGradient>
				<radialGradient id="kkTvaroh" cx="48%" cy="46%" r="52%">
					<stop offset="0%" stopColor="#FFFFFF" />
					<stop offset="65%" stopColor="#FFFDF5" />
					<stop offset="90%" stopColor="#F5EFE0" />
					<stop offset="100%" stopColor="#EADBBE" />
				</radialGradient>
				<linearGradient id="kkPovidla" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#38140B" />
					<stop offset="50%" stopColor="#240D07" />
					<stop offset="100%" stopColor="#150603" />
				</linearGradient>
				<linearGradient id="kkAlmond" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#FFFFFF" />
					<stop offset="40%" stopColor="#FDFBF7" />
					<stop offset="85%" stopColor="#F1E5D5" />
					<stop offset="100%" stopColor="#DFCBB3" />
				</linearGradient>
			</defs>

			{/* Ground Shadow */}
			<ellipse cx="100" cy="106" rx="92" ry="86" fill="url(#kkShadow)" />

			{/* Outer Baked Yeast Dough Crust */}
			<path
				d="M 100 8 C 152 8, 192 48, 192 100 C 192 152, 152 192, 100 192 C 48 192, 8 152, 8 100 C 8 48, 48 8, 100 8 Z"
				fill="url(#kkCrust)"
				stroke="#1E150B"
				strokeWidth="3.5"
				strokeLinejoin="round"
			/>

			{/* Dark roasted patches on crust edge */}
			<path d="M 35 35 C 55 18, 85 13, 115 13 C 105 21, 55 28, 35 35 Z" fill="#6B280A" opacity="0.45" />
			<path d="M 155 42 C 178 65, 188 95, 187 125 C 180 115, 172 75, 155 42 Z" fill="#581F08" opacity="0.45" />
			<path d="M 165 145 C 145 175, 115 188, 85 188 C 95 180, 145 170, 165 145 Z" fill="#6B280A" opacity="0.4" />
			<path d="M 30 145 C 14 120, 12 85, 20 60 C 26 75, 28 120, 30 145 Z" fill="#7C2D12" opacity="0.4" />

			{/* Egg-wash gloss highlights */}
			<path d="M 45 22 C 75 12, 120 12, 155 24" fill="none" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
			<path d="M 168 50 C 182 75, 184 105, 178 135" fill="none" stroke="#FDE68A" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />

			{/* Creamy Tvaroh Filling */}
			<circle cx="100" cy="100" r="77" fill="url(#kkTvaroh)" stroke="#1E150B" strokeWidth="2.8" />

			{/* Tvaroh spread texture */}
			<path d="M 70 85 Q 85 70 110 75" fill="none" stroke="#EADBBE" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
			<path d="M 95 120 Q 120 125 135 110" fill="none" stroke="#EADBBE" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

			{/* 8 Radial Povidla Spokes */}
			<g stroke="url(#kkPovidla)" strokeWidth="3.6" strokeLinecap="round">
				<path d="M 100 86 Q 99 55 100 24" />
				<path d="M 110 90 Q 132 68 154 46" />
				<path d="M 114 100 Q 145 99 176 100" />
				<path d="M 110 110 Q 132 132 154 154" />
				<path d="M 100 114 Q 101 145 100 176" />
				<path d="M 90 110 Q 68 132 46 154" />
				<path d="M 86 100 Q 55 101 24 100" />
				<path d="M 90 90 Q 68 68 46 46" />
			</g>

			{/* Scalloped Wavy Garland between each spoke */}
			<g fill="none" stroke="url(#kkPovidla)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M 100 32 Q 107 41 114 36 Q 122 46 130 40 Q 139 49 146 45" />
				<path d="M 152 52 Q 157 61 164 61 Q 158 72 167 76 Q 160 86 168 94" />
				<path d="M 168 106 Q 160 114 167 124 Q 158 128 164 139 Q 157 139 152 148" />
				<path d="M 146 155 Q 139 151 130 160 Q 122 154 114 164 Q 107 159 100 168" />
				<path d="M 100 168 Q 93 159 86 164 Q 78 154 70 160 Q 61 151 54 155" />
				<path d="M 48 148 Q 43 139 36 139 Q 42 128 33 124 Q 40 114 32 106" />
				<path d="M 32 94 Q 40 86 33 76 Q 42 72 36 61 Q 43 61 48 52" />
				<path d="M 54 45 Q 61 49 70 40 Q 78 46 86 36 Q 93 41 100 32" />
			</g>

			{/* Mid-Sector Povidla Dashes */}
			<g stroke="url(#kkPovidla)" strokeWidth="3" strokeLinecap="round">
				<path d="M 116 62 Q 125 53 131 47" />
				<path d="M 138 84 Q 147 90 153 96" />
				<path d="M 138 116 Q 147 110 153 104" />
				<path d="M 116 138 Q 125 147 131 153" />
				<path d="M 84 138 Q 75 147 69 153" />
				<path d="M 62 116 Q 53 110 47 104" />
				<path d="M 62 84 Q 53 90 47 96" />
				<path d="M 84 62 Q 75 53 69 47" />
			</g>

			{/* Raisins / Dark Povidla Dots (outer ring just inside rim) */}
			<g fill="#240D07" stroke="#150603" strokeWidth="0.8">
				<circle cx="108" cy="28" r="2.2" />
				<circle cx="120" cy="30" r="2" />
				<circle cx="132" cy="35" r="2.2" />
				<circle cx="142" cy="42" r="2" />
				<circle cx="158" cy="58" r="2.2" />
				<circle cx="165" cy="70" r="2" />
				<circle cx="170" cy="82" r="2.2" />
				<circle cx="170" cy="118" r="2.2" />
				<circle cx="165" cy="130" r="2" />
				<circle cx="158" cy="142" r="2.2" />
				<circle cx="142" cy="158" r="2" />
				<circle cx="132" cy="165" r="2.2" />
				<circle cx="120" cy="170" r="2" />
				<circle cx="108" cy="172" r="2.2" />
				<circle cx="92" cy="172" r="2.2" />
				<circle cx="80" cy="170" r="2" />
				<circle cx="68" cy="165" r="2.2" />
				<circle cx="58" cy="158" r="2" />
				<circle cx="42" cy="142" r="2.2" />
				<circle cx="35" cy="130" r="2" />
				<circle cx="30" cy="118" r="2.2" />
				<circle cx="30" cy="82" r="2.2" />
				<circle cx="35" cy="70" r="2" />
				<circle cx="42" cy="58" r="2.2" />
				<circle cx="58" cy="42" r="2" />
				<circle cx="68" cy="35" r="2.2" />
				<circle cx="80" cy="30" r="2" />
				<circle cx="92" cy="28" r="2.2" />
			</g>

			{/* Central Almond Flower Rosette (8 Blanched Almonds) */}
			<g stroke="#1E150B" strokeWidth="1.3" strokeLinejoin="round">
				{[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
					<g key={angle} transform={`translate(100, 100) rotate(${angle})`}>
						<path d="M 0 -7 C -4 -13, -3 -22, 0 -26 C 3 -22, 4 -13, 0 -7 Z" fill="url(#kkAlmond)" />
						<path d="M 0 -10 L 0 -23" fill="none" stroke="#D1BEA8" strokeWidth="0.8" opacity="0.7" />
					</g>
				))}
			</g>

			{/* Center Raisin / Core */}
			<circle cx="100" cy="100" r="6" fill="#1C0A04" stroke="#1E150B" strokeWidth="1.8" />
			<circle cx="98.5" cy="98.5" r="1.5" fill="#582613" />
		</svg>
	);
};
