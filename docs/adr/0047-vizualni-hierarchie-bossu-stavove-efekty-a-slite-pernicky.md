# Vizuální hierarchie bossů, kreslené stavové efekty a stupně perníčků

## Kontext a rozhodnutí

Po vyřešení základní hierarchie linek, nočních fází a tvarosloví projektilů (ADR 0045 a ADR 0046) bylo nutné definovat vizuální prezentaci klíčových herních stavů: identifikaci bossů v hordě stovek strašidel, znázorňování stavových efektů na kvašových postavách, vizuální kompresi sloučené kořisti a varování při kritickém vyčerpání Kuráže.

Byla schválena tato systémová pravidla:
1. **Vizuální kotva bossů a velitelů**: Bossové a Ostřílení běsi se v chumlu orientují pomocí zesílené 4px tušové kontury s kvašovým tečkováním a malované Kramářské pečeti vznášející se nad hlavou (vyřezávaný folklórní erb odpovídající typu bosse), čímž odpadá nutnost moderních arkádových šipek či kruhů pod nohama.
2. **Kreslené stavové efekty bez RGB tintu**: Namísto celoplošného digitálního přebarvování postavy (které ničí jemnou kvašovou perokresbu) se stavy znázorňují fyzickými kreslenými doplňky:
   - *Zmrazení*: Kreslené rampouchy z klobouku a šatů se zamrznutím fáze kolébání.
   - *Zapálení*: Stoupající kreslené uhlíky, tužkové šrafování sazí na okrajích a kouř.
   - *Zpomalení*: Komické odletující kapky bláta či pivní pěny u nohou a poloviční frekvence kroku.
3. **Stupně slitých perníčků**: Kořist na bojišti využívá 3-stupňovou vizuální hierarchii v 10% zlaté paletě:
   - Drobná perníková hvězdička/srdíčko (1 hodnota, 14 px).
   - Slitý mandlový perníkový bochánek s bílou polevou (5–10 hodnot, 22 px).
   - Královský marcipánový kůň se zlacením a jemnou svatozáří (50+ hodnot, 32 px).
4. **Knižní viněta nízké Kuráže**: Při poklesu Kuráže pod 35 % (Zoufalá kuráž) se namísto krvavé viněty aplikuje jemné zežloutnutí okrajů do vazby staré ilustrované knihy s tužkovým šrafováním v rozích, doprovázené komickými kapkami potu a poplašeným dýmem z lovcovy fajfky.

## Důsledky

- Dokončení ucelené umělecké a vizuální specifikace pro 2D Canvas rendering v plné paritě s Ladovským stylem.
- Eliminace všech prvků vizuálního smogu a digitálních artefaktů cizích českému pohádkovému folklóru.
- Aktualizace pojmů v `GLOSSARY.md`.
