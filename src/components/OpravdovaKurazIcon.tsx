import React from 'react';

export interface OpravdovaKurazIconProps {
	size?: string | number;
	className?: string;
	style?: React.CSSProperties;
	[key: string]: any;
}

export const OpravdovaKurazIcon: React.FC<OpravdovaKurazIconProps> = ({
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
			aria-label="Opravdová kuráž – zaťatá pěst odvahy a nezlomnosti v ladovském stylu"
			{...props}
		>
			<defs>
				{/* Soft warm shadow */}
				<radialGradient id="kurazShadow" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stopColor="#26170E" stopOpacity="0.38" />
					<stop offset="65%" stopColor="#26170E" stopOpacity="0.14" />
					<stop offset="100%" stopColor="#26170E" stopOpacity="0" />
				</radialGradient>

				{/* Warm folk skin gradient (Ladovská paleta – zdravá venkovská pleť) */}
				<linearGradient id="kurazSkin" x1="20%" y1="15%" x2="85%" y2="85%">
					<stop offset="0%" stopColor="#FED7AA" />
					<stop offset="35%" stopColor="#FDBA74" />
					<stop offset="70%" stopColor="#FB923C" />
					<stop offset="100%" stopColor="#EA580C" />
				</linearGradient>

				{/* Deep warm shadow on hand muscles */}
				<linearGradient id="kurazHandShade" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#EA580C" />
					<stop offset="100%" stopColor="#9A3412" />
				</linearGradient>

				{/* Traditional Czech rustic yellow sleeve (Ladovský žlutý kabátek / košile) */}
				<linearGradient id="kurazSleeve" x1="15%" y1="30%" x2="85%" y2="90%">
					<stop offset="0%" stopColor="#FDE047" />
					<stop offset="45%" stopColor="#F59E0B" />
					<stop offset="85%" stopColor="#D97706" />
					<stop offset="100%" stopColor="#B45309" />
				</linearGradient>

				{/* Sleeve inner cuff hem */}
				<linearGradient id="kurazCuffLining" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#FFFDF5" />
					<stop offset="60%" stopColor="#FEF3C7" />
					<stop offset="100%" stopColor="#FDE68A" />
				</linearGradient>
			</defs>

			{/* Ground / Ambient Shadow */}
			<ellipse cx="48" cy="88" rx="28" ry="7" fill="url(#kurazShadow)" />

			{/* Back Shadow of Arm & Fist (Extra depth and hand-inked weight) */}
			<path
				d="M 23 54 C 20 62, 22 75, 27 82 C 34 89, 48 85, 56 73 C 66 59, 79 46, 78 30 C 77 18, 64 12, 53 14 C 44 16, 40 24, 42 32 C 38 40, 31 46, 23 54 Z"
				fill="#2A170B"
				opacity="0.18"
				transform="translate(1.5, 2.5)"
			/>

			{/* Forearm Flesh (Ruka vystupující z rukávu) */}
			<path
				d="M 34 52 C 39 44, 44 38, 48 30 L 57 26 C 66 32, 69 44, 63 56 C 57 65, 48 68, 38 68 Z"
				fill="url(#kurazSkin)"
			/>

			{/* Forearm muscular tendon shadow (Šlachy zápěstí) */}
			<path
				d="M 40 59 C 43 51, 46 44, 50 36 C 52 42, 49 52, 46 62 Z"
				fill="url(#kurazHandShade)"
				opacity="0.65"
			/>
			<path
				d="M 47 64 C 51 56, 56 48, 60 41 C 62 45, 59 55, 54 64 Z"
				fill="url(#kurazHandShade)"
				opacity="0.5"
			/>

			{/* Main Fist Silhouette & Base Skin */}
			<path
				d="M 47 22 C 44 19, 46 15, 52 14 C 58 13, 67 15, 74 21 C 80 26, 81 33, 76 40 C 72 46, 68 53, 62 58 C 56 63, 49 65, 41 61 C 36 56, 36 49, 40 43 C 42 38, 42 32, 43 27 C 44 24, 45 22, 47 22 Z"
				fill="url(#kurazSkin)"
				stroke="#1E150B"
				strokeWidth="4.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Thumb (Palec sevřený přes prsty) */}
			<path
				d="M 45 22 C 43 25, 42 31, 44 36 C 46 41, 51 46, 57 48 C 62 50, 63 47, 62 44 C 60 40, 56 36, 53 31 C 51 27, 50 23, 47 22 Z"
				fill="#FED7AA"
				stroke="#1E150B"
				strokeWidth="3.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Thumb nail bed (Nehet na palci v Ladovském stylu) */}
			<path
				d="M 49 20 C 51 18, 54 19, 54 22 C 54 24, 51 25, 49 24 Z"
				fill="#FFFDF7"
				stroke="#1E150B"
				strokeWidth="1.8"
				strokeLinejoin="round"
			/>

			{/* Curled Fingers - Strong Inked Folds and Joint Creases */}
			{/* Index finger crease */}
			<path
				d="M 49 25 C 54 22, 60 21, 67 25 C 72 28, 73 34, 69 38 C 65 41, 60 39, 56 35"
				fill="none"
				stroke="#1E150B"
				strokeWidth="3.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Middle finger crease */}
			<path
				d="M 54 31 C 61 29, 68 30, 73 34 C 76 38, 74 43, 69 46 C 65 48, 60 45, 58 42"
				fill="none"
				stroke="#1E150B"
				strokeWidth="3.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Ring finger crease */}
			<path
				d="M 57 39 C 63 38, 69 40, 72 44 C 74 48, 71 52, 66 54 C 62 55, 59 52, 58 48"
				fill="none"
				stroke="#1E150B"
				strokeWidth="3.4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Pinky crease */}
			<path
				d="M 60 48 C 64 47, 68 49, 70 53 C 71 56, 68 59, 63 60"
				fill="none"
				stroke="#1E150B"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Distinctive Dark Ink Shadow Clefts (Záseky stínů mezi prsty – jako v předloze) */}
			<path d="M 54 26 L 61 31 L 56 34 Z" fill="#1E150B" />
			<path d="M 58 34 L 66 39 L 60 42 Z" fill="#1E150B" />
			<path d="M 61 42 L 67 47 L 62 50 Z" fill="#1E150B" />

			{/* Wrist tendon contours (Výrazné šlachy na předloktí) */}
			<path
				d="M 40 54 C 44 48, 47 43, 50 37"
				fill="none"
				stroke="#1E150B"
				strokeWidth="3.4"
				strokeLinecap="round"
			/>
			<path
				d="M 47 62 C 51 55, 55 49, 58 42"
				fill="none"
				stroke="#1E150B"
				strokeWidth="3"
				strokeLinecap="round"
			/>
			<path
				d="M 43 65 C 47 60, 50 56, 52 52"
				fill="none"
				stroke="#1E150B"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.6"
			/>

			{/* Wholesome Gouache Highlights on Knuckles (Ladovské bílé kvašové lesky) */}
			<path
				d="M 56 16 C 62 17, 68 20, 72 24"
				fill="none"
				stroke="#FFFFFF"
				strokeWidth="2.6"
				strokeLinecap="round"
				opacity="0.75"
			/>
			<path
				d="M 74 27 C 77 30, 77 35, 75 39"
				fill="none"
				stroke="#FFFFFF"
				strokeWidth="2.2"
				strokeLinecap="round"
				opacity="0.65"
			/>
			<path
				d="M 45 28 C 45 32, 47 37, 50 40"
				fill="none"
				stroke="#FFFFFF"
				strokeWidth="2"
				strokeLinecap="round"
				opacity="0.7"
			/>

			{/* RUSTIC SLEEVE / YUCCA CUFF (Ladovský venkovský rukáv s ohrnutou manžetou) */}
			{/* Main yellow sleeve body */}
			<path
				d="M 22 53 C 25 50, 36 45, 41 46 C 40 54, 46 62, 56 68 C 53 72, 49 76, 44 80 C 36 84, 28 80, 24 74 C 21 68, 20 59, 22 53 Z"
				fill="url(#kurazSleeve)"
				stroke="#1E150B"
				strokeWidth="4.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Fold / Crease on yellow sleeve */}
			<path
				d="M 28 62 C 32 70, 38 74, 45 74"
				fill="none"
				stroke="#1E150B"
				strokeWidth="3.6"
				strokeLinecap="round"
			/>
			<path
				d="M 29 63 C 33 69, 38 73, 44 73"
				fill="none"
				stroke="#B45309"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>

			{/* Sleeve cuff turn-back rim */}
			<path
				d="M 41 46 C 47 50, 52 58, 56 67 C 53 71, 48 76, 43 79 C 40 70, 38 60, 41 46 Z"
				fill="url(#kurazCuffLining)"
				stroke="#1E150B"
				strokeWidth="3.4"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* Under-cuff fold detail */}
			<path
				d="M 43 56 C 46 63, 48 68, 49 73"
				fill="none"
				stroke="#D97706"
				strokeWidth="2"
				strokeLinecap="round"
			/>

			{/* Folk highlight on yellow cuff */}
			<path
				d="M 24 57 C 23 64, 24 70, 27 75"
				fill="none"
				stroke="#FEF08A"
				strokeWidth="2.5"
				strokeLinecap="round"
				opacity="0.8"
			/>
		</svg>
	);
};
