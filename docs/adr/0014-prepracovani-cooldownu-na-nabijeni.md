# Přepracování cooldownu na rychlost nabíjení (Nabíjení)

## Kontext
Původní herní mechanika používala pro časování zbraní a schopností klasickou redukci prodlevy (Cooldown Reduction, CDR). Tento model trpěl závažnými neduhy:
1. **Hyperbolické škálování**: S každým dalším procentem redukce hodnota statu exponenciálně rostla (při 50 % útočí zbraň 2× rychleji, při 75 % 4× rychleji a při 90 % 10× rychleji), což si vynucovalo umělý a pro hráče neintuitivní *Strop kadence* (odřezávání na -75 %).
2. **Křečovité hodnoty a hacky v kódu**: Položka *Opravdová káva* musela v datech používat číslo `0.1111111111`, aby v UI vycházela rovná hodnota -10 %.
3. **Nekonzistentní a anglické názvosloví**: V textech se míchal „cooldown“, „prodleva útoků“, „doba přípravy“ a z nákupu *Pivního tácku* vyskakovala hláška `ROZOHNĚNÍ: -25 % COOLDOWN! ⚡`.

## Rozhodnutí

### 1. Kánonický termín: Nabíjení
V doménovém modelu (GLOSSARY.md) byl zaveden termín **Nabíjení** (_Avoid_: cooldown, CDR, snížení cooldownu, prodleva, cooldown reduction, attack speed). Pro hráče se v popisech, kartách předmětů a v inspekci postavy stat jmenuje prostě **Nabíjení** (případně „rychlost nabíjení“).

### 2. Lineární matematický model
Čas mezi dvěma útoky zbraně či použitími schopnosti se nově počítá jako:
$$\text{Výsledná prodleva} = \frac{\text{Základní prodleva}}{1 + \text{Nabíjení lovce} + \text{Nabíjení zbraně}}$$

- Každé +1 % Nabíjení lineárně zvyšuje počet útoků za sekundu o +1 % (např. +50 % Nabíjení = 1,5× úderů/s, +100 % Nabíjení = 2× úderů/s).
- Odstraňuje se nutnost umělého 75% stropu kadence – vzorec je přirozeně stabilní, nedochází ke zhroucení k nule ani k dělení nulou.

### 3. Přepracování položek v dědečkově nůši
- **Opravdová káva** (`opravdova_kava`): `+15 % nabíjení všech zbraní` (odstraněn hack `0.1111111111`).
- **Pivní tácek s čárkami** (`pivni_tacek`): Dočasný 6s buff propůjčuje `+35 % rychlost nabíjení všech zbraní` a v boji hlásí: `ROZOHNĚNÍ: +35 % RYCHLEJŠÍ NABÍJENÍ! ⚡`.
- **Pouťové perníkové srdce** (`poutove_srdce`): Sebrané perníčky okamžitě dobíjejí schopnost (+0,2 s / +0,6 s / +2 s k nabití schopnosti).
- **Babiččiny kousavé fusekle** (`babicciny_kousave_fusekle`): V inspekci zobrazeno `+X % nabíjení v pohybu`.

### 4. Harmonizace zbraňových vylepšení a synergií
Všechna vylepšení zbraní (běžné upgrady i synergické speciality) byla převedena z procentuálního odčítání cooldownu na procentuální navýšení Nabíjení:
- Standardní kadenční upgrady: `+40 % nabíjení` (místo `-30 % cooldown`) a `+80 % nabíjení, -25 % velikost švihu` (místo `-45 % cooldown`).
- Synergické upgrady: Okurkový protlak (`+12 % nabíjení`), Pomlázka (`+20 % nabíjení`), Svatební koláč (`+12 % nabíjení`), Svatojánská kytice (`+25 % nabíjení`), Popelový brambor (`+15 % nabíjení`) a Sukovitá hůl (`-15 % nabíjení`).

## Důsledky
- Stat Nabíjení má čistou a spravedlivou mechaniku bez skrytých asymptot a bez nutnosti umělého odřezávání stropem.
- Ladovský folklórní slovník hry je sjednocen a zbaven anglicismů.
- Hráč okamžitě rozumí tomu, o kolik procent rychleji jeho zbraň udeří.
