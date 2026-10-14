# Systém vylepšení zbraní, kategorie a milníky

## Kontext
Původní systém rozvoje zbraní v Bubákově trpěl několika nedostatky:
1. Nemilníkové úrovně (2, 4, 6 a 7) měly fixní generický bonus (+12 % zranění, +8 % cooldown, +6 % dosah) pro všechny zbraně bez rozdílu archetypu.
2. Hráč neměl možnost vidět variabilitu běžných vylepšení, sečné zbraně a aury postrádaly specifické tematické kompromisy (např. obětování dosahu za extrémní kadenci nebo naopak).
3. Neexistoval bezpečnostní strop pro redukci prodlevy mezi útoky (cooldown reduction), což mohlo vést k zacyklení zbraní a chybám enginu.
4. Bylinková fajfka existovala pouze jako experimentální/pomocná zbraň bez milníků a plné integrace do 8-úrovňového arzenálu.

## Rozhodnutí

### 1. Struktura 8 úrovní a 3 milníků
Každá zbraň má přesně 8 úrovní:
- **Úroveň 1**: Základní zbraň.
- **Úrovně 3, 5 a 8 (Milníky I, II, III)**: Významné rozcestí, kde hráč volí jednu ze dvou unikátních vzájemně výlučných specializací. Pro 16 kanonických zbraní existuje celkem 96 milníkových variant s plnou českou i anglickou lokalizací.
- **Úrovně 2, 4, 6 a 7 (Běžná vylepšení)**: Vylepšení tažená náhodně z tematického bazénu dané kategorie zbraně.

### 2. Tematické bazény běžných vylepšení
Zbraně jsou rozděleny do kategorií se specifickými bazény o 6 vylepšeních:

#### A. Sečné zbraně (`melee`)
Přiřazené zbraně: `osikovy_prut`, `kovarske_vidle`, `kovana_halapartna`, `dreveny_cep`, `valecnice`.
- **Široký rozmach** (`melee_cleave`): +120 % velikost švihu, -20 % zranění
- **Prodloužený dosah** (`melee_reach`): +60 % velikost švihu
- **Svižná ruka** (`melee_flurry`): -30 % cooldown
- **Drtivý dopad** (`melee_heavy`): +100 % zranění
- **Titánský švih** (`melee_titan`): +60 % zranění, +40 % velikost švihu
- **Zběsilé sekání** (`melee_frenzy`): -45 % cooldown, -25 % velikost švihu

#### B. Aury a plošná pole (`aura`)
Přiřazené zbraně: `hromnicka`, `cesnekova_topinka`, `bylinkova_fajfka`.
- **Rozpínavé pole** (`aura_overgrowth`): +85 % poloměr zóny, -25 % zranění
- **Široké vyzařování** (`aura_reach`): +45 % poloměr zóny
- **Vysoká frekvence** (`aura_pulse`): -30 % prodleva mezi pulzy
- **Smrtící koncentrace** (`aura_intensity`): +100 % zranění
- **Přetížené jádro** (`aura_unstable`): +60 % zranění, +30 % poloměr zóny
- **Zhroucená zóna** (`aura_singularity`): +120 % zranění, -30 % prodleva pulzů, -35 % poloměr zóny

#### C. Projektilové a vrhací zbraně (`default`)
Zbraně: `kysela_okurka`, `povidlove_buchty`, `devatero_kviti`, `snehova_koule`, `kynuty_kolac`, `horky_brambor`, `vceli_roj`, `svecena_kropenka`.
- Používají osvědčenou postupnou folklórní progresi (+12 % zranění, +8 % cooldown, +6 % plocha/dosah).

### 3. Mechanika náhodného losování a opakovatelnost
- Vylepšení se nevbírají z pauzovacích voleb při postupu na úroveň.
- **Nůše Čertova dědečka**: Při generování nabídky vylepšení pro zbraň se konkrétní vylepšení z bazénu předem vylosuje. Hráč vidí jeho název a přesný účinek přímo na kartě nabídky ještě před nákupem.
- **Truhly**: Vypadnuvší vylepšení je vylosováno ze způsobilých vylepšení pro danou zbraň.
- **Opakovatelnost**: Vylepšení se mohou libovolně opakovat (např. 2x Drtivý dopad sečte bonus na +200 % zranění).

### 4. Strop kadence (-75 %) a ochrana nabídky (Headroom)
- **Strop kadence (`COOLDOWN_REDUCTION_CAP = 0.75`)**: Celkové zkrácení prodlevy zbraně z běžných vylepšení nesmí překročit 75 % (zbraň střílí maximálně 4x rychleji než základ).
- **Ochrana nabídky (Headroom filtering)**: Pokud zbývá do stropu méně než 10 % volného prostoru (`headroom < 0.10`), vylepšení zkracující cooldown (`cooldown_reduction > 0`) jsou z nabídky (obchod i truhly) zcela vyřazena. Hráči nejsou nabízeny karty, jejichž hodnota by propadla stropem.
- **Vizuální indikace**: Hráč je v obchodě i na obrazovce pozastavení informován o dosažení stropu či zbývajícím prostoru.

### 5. Bylinková fajfka jako 16. plnohodnotná zbraň
- Bylinková fajfka je zařazena mezi kanonické zbraně s 8 úrovněmi a kategorií `aura`.
- Vypouští oblak bylinného dýmu, který zraňuje a zpomaluje nepřátele a léčí lovce.
- **Milníky bez odhození**: Žádný z milníků na úrovních 3, 5 a 8 neobsahuje odhazování nepřátel (`knockbackMult: undefined`). Namísto toho nabízí výrazně vyšší plošný rádius, zranění a trvání dýmu (např. Krakonošův opar s +40 % poloměrem a +3.5 s trváním).

## Přehled kanonických zbraní (16)

| ID zbraně | Název | Kategorie | Typ poškození |
|---|---|---|---|
| `osikovy_prut` | Osikový prut | sečná (`melee`) | fyzické |
| `valecnice` | Válečnice | sečná (`melee`) | fyzické |
| `cesnekova_topinka` | Česneková topinka | aura (`aura`) | česnekové / posvátné |
| `kysela_okurka` | Kyselá okurka | projektilová | kyselé |
| `povidlove_buchty` | Povidlové buchty | vrhací | sladké / lepivé |
| `kovarske_vidle` | Kovářské vidle | sečná (`melee`) | bodné / fyzické |
| `kovana_halapartna`| Kovaná halapartna | sečná (`melee`) | sečné / fyzické |
| `dreveny_cep` | Dřevěný cep | sečná (`melee`) | drtivé / fyzické |
| `devatero_kviti` | Devatero kvítí | projektilová | přírodní |
| `snehova_koule` | Sněhová koule | vrhací | mrazivé |
| `kynuty_kolac` | Kynutý koláč | vrhací | hutné |
| `horky_brambor` | Horký brambor | vrhací | ohnivé |
| `vceli_roj` | Včelí roj | projektilová | přírodní / žihadla |
| `hromnicka` | Hromnička | aura (`aura`) | posvátné světlo |
| `svecena_kropenka` | Svěcená kropenka | projektilová | posvátná voda |
| `bylinkova_fajfka` | Bylinková fajfka | aura (`aura`) | přírodní dým |

## Důsledky
- Sečné a aurické zbraně nabízejí hlubokou variabilitu v každém běhu díky náhodně taženým běžným vylepšením s tematickými klady a zápory.
- Odstraněno plýtvání perníčky za překročený cooldown díky filtru nabídky při zbývajícím prostoru < 10 %.
- Všechny zbraně mají konzistentní 8-úrovňový model a plnou podporu v lokalizaci i uživatelském rozhraní.
