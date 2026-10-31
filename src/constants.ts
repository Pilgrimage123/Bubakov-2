var COLORS = {
	parchment: "#F3E9D2",
	parchmentDark: "#E2D5BA",
	ink: "#111111",
	red: "#D1342B",
	mustard: "#D9A036",
	wood: "#5E3A21",
	woodLight: "#8C5A35",
	woodDark: "#3D2210",
	white: "#EAE3D1",
	water: "#3A76A8",
	green: "#4A633B",
	leafGreen: "#4A633B",
	skin: "#E6B89C",
	grey: "#8A887D",
	stoneGrey: "#8A887D",
	bone: "#D4CEB8",
	ice: "#C4E1F6",
	pineGreen: "#233E2B",
	frostWhite: "#F8F9FA",
	purpleDark: "#2C1D38",
	orangeSunset: "#E06D29"
};
var DAY_PHASES = [
	{
		id: "noon",
		name: "Poledne (12:00)",
		timeRange: [0, 60],
		skyColor: "#F7EDD5",
		ambientTint: "rgba(255, 240, 210, 0)",
		description: "Slunce stojí vysoko nad polnostmi. Z horkých mezí vylézá polní havěť a zákeřná Polednice!",
		icon: "☀️"
	},
	{
		id: "afternoon",
		name: "Odpoledne (15:00)",
		timeRange: [60, 120],
		skyColor: "#F3E4C0",
		ambientTint: "rgba(217, 160, 54, 0.08)",
		description: "Stíny se prodlužují. Z hvozdu vylézají divoženky a k rybníkům míří první hastrmani.",
		icon: "🌤️"
	},
	{
		id: "dusk",
		name: "Klekání & Soumrak (18:00)",
		timeRange: [120, 180],
		skyColor: "#E2B18E",
		ambientTint: "rgba(224, 109, 41, 0.2)",
		description: "Zvoní klekání! Přichází hrozivá Klekánice a v zápachu síry kráčí Pekelný Čert.",
		icon: "🌅",
		bossSpawns: ["cert"]
	},
	{
		id: "night",
		name: "Hluboká noc (21:00)",
		timeRange: [180, 240],
		skyColor: "#30394A",
		ambientTint: "rgba(25, 33, 49, 0.45)",
		description: "Tma padla na vesnici. Z márnice vstávají umrlci a ve stodolách hučí strašlivý Bubák.",
		icon: "🌙"
	},
	{
		id: "midnight",
		name: "Půlnoční hodina (00:00)",
		timeRange: [240, 360],
		skyColor: "#171D28",
		ambientTint: "rgba(15, 20, 30, 0.65)",
		description: "Hodina duchů! Ze staletých hvozdů zařval Půlnoční Hejkal a nastává běsnění!",
		icon: "🕛",
		bossSpawns: ["hejkal"]
	},
	{
		id: "dawn",
		name: "Kuropění & Svítání (04:00)",
		timeRange: [360, 99999],
		skyColor: "#FFEBD2",
		ambientTint: "rgba(255, 220, 180, 0)",
		description: "Kohout zakokrhal! Noční mocnosti ztrácejí vládu a strašidla prchají do hrobů a bažin!",
		icon: "🐓"
	}
];
function getCurrentDayPhase(seconds: number, levelId?: number) {
	if (levelId === 0 || levelId === 2 || levelId === 4) {
		// 1. úroveň (Denní tání), 3. úroveň (Dubnový den) a 5. úroveň (Květen v Hrusicích, 5 minut / 300 s): pouze světlé denní fáze (Poledne 0–150 s, Odpoledne 150 s+)
		if (seconds < 150) return DAY_PHASES[0];
		return DAY_PHASES[1];
	}
	if (levelId === 6) {
		// 7. úroveň (Červen v Hrusicích, 5 minut / 300 s): Ranní senoseč & polední žár (0–120 s), Odpolední pekelný žár (120–220 s), Podvečerní tůně & svatojánská bouře (220–300 s), Kuropění (300 s+)
		if (seconds < 120) return DAY_PHASES[0];
		if (seconds < 220) return DAY_PHASES[1];
		if (seconds < 300) return DAY_PHASES[2];
		return DAY_PHASES[5];
	}
	if (levelId === 1) {
		// 2. úroveň (Noční mrazy, 5 minut / 300 s): tmavé fáze rozprostřené do 300 s (Soumrak 0–100 s, Hluboká noc 100–200 s, Půlnoc 200–300 s, Kuropění 300 s+)
		if (seconds < 100) return DAY_PHASES[2];
		if (seconds < 200) return DAY_PHASES[3];
		if (seconds < 300) return DAY_PHASES[4];
		return DAY_PHASES[5];
	}
	for (let i = DAY_PHASES.length - 1; i >= 0; i--) if (seconds >= DAY_PHASES[i].timeRange[0]) return DAY_PHASES[i];
	return DAY_PHASES[0];
}
var ENEMY_POINTS = {
	pampeliska_chmyri: 12,
	pampeliska_chmyricko: 6,
	chroust: 16,
	zaba: 10,
	mysak: 14,
	rarach: 18,
	sotek: 20,
	plivnik: 24,
	zmrzlik: 25,
	blatouch: 30,
	skodnik: 30,
	bludicka: 48,
	vodnicek: 50,
	vanicka: 50,
	skeleton: 52,
	kostlivec: 52,
	mrazik: 52,
	pisar: 63,
	hrobnik: 69,
	skeleton_scythe: 71,
	kostlivec_kosa: 71,
	meluzina: 85,
	divozenka: 87,
	umrlec: 90,
	certik: 100,
	hastrman: 110,
	topivec: 128,
	ohnivy_muz: 142,
	stodolnik: 145,
	cerny_pes: 164,
	severak: 165,
	klekanice: 179,
	drevorubec: 182,
	bubak: 211,
	polednice: 236,
	drab: 261,
	hromotluk: 330,
	cert: 1540,
	hejkal: 2760,
	obr: 4600,
	zbojnik: 135,
	jiskrivec: 95,
	bila_pani: 185,
	zbrojnos: 290,
	snehulak: 220,
	tajici_snehulak: 49,
	nocni_mura: 110,
	ohnivy_pes: 175,
	mlynar: 5500,
	bezhlavy_rytir: 6800,
	drak: 9900,
	sazovy_rarach: 68,
	ropucha: 82,
	krvavy_kostlivec: 130,
	obrneny_zbojnik: 240,
	vrana: 22,
	mrazovy_skritek: 26,
	jezinka_mraziva: 68,
	mrazivy_obr: 115,
	morana: 950,
	krvavy_rarach: 62,
	kalny_hastrman: 105,
	cerny_vlkodlak: 110,
	carodejnice_zaspalka: 750,
	ledovi_muzi: 4800,
	rak_ricni: 65,
	boruvkovy_diblik: 45,
	roj_polnich_mysaku: 24,
	pekelny_roj_sazovniku: 32,
	cert_sekac: 650,
	kralovsky_vele_rak: 1200,
	kralovska_polednice: 7500
};
var DROP_THRESHOLDS = {
	chest: 29400,
	potion: 450,
	bread: 250,
	soul: 260,
	coin: 20
};
var GRANNY_CUTSCENE = {
	duration: 5.6,
	applyAt: 3.2
};
const DAWN_TIME_SECONDS = 360;

export { COLORS, DAY_PHASES, getCurrentDayPhase, ENEMY_POINTS, DROP_THRESHOLDS, GRANNY_CUTSCENE, DAWN_TIME_SECONDS };
