# Tající sněhuláci: Horda s Virtuálním vůdcem (Virtual Leader), slotovými posuny a mechanikou vodních louží

Zavádíme architekturu 40členné hordy „Tající sněhuláci“ v 1. úrovni (Předjaří v Hrusicích) řízené jedním neviditelným Virtuálním vůdcem (Virtual Leader), která odstraňuje dřívější přívlastek „zákeřný“, nahrazuje jej chytrým skupinovým chováním s nulovou alokační zátěží (Zero GC) a obohacuje hratelnost o tání a nebezpečné vodní louže.

## Kontext a důvody
1. **Odstranění nesourodého označení**: Původní „Zákeřný tající sněhulák“ neodpovídal folklórní ladovské poetice Předjaří a neměl ucelenou hordovou dynamiku.
2. **Výkonnostní strop a O(1) navigace**: Běžné líhnutí 40 samostatných monster vede k O(N²) kolizím a separacím každého snímku. Virtuální vůdce s Fermatovým/zlatým úhlem rozmisťuje sloty deterministicky kolem středu formace a spotřebovává fixní O(1) navigaci.
3. **Plynulé odtrhávání a směrování**: Běžné slotové formace trpí chybou, kdy odhozený nepřítel couvá od hráče zpět do formace. Odtrhávací vodítko (Breakaway Leash) po překročení mezní vzdálenosti přepíná sněhuláka na přímé pronásledování lovce.
4. **Alokační čistota louží**: 40 současně se rozpouštějících sněhuláků by při dynamické alokaci způsobilo znatelný GC spike. Předalokovaný fond 40 louží a typová pole eliminují jakoukoli alokaci za běhu.

## Rozhodnutí
1. **Architektura Virtual Leader + Slot Offsets**:
   - 1 neviditelný Virtuální vůdce a 40 následovníků (`MeltingSnowman`).
   - Vůdce se pohybuje pomalou chůzí (40 px/s) přímo k hráči.
   - 40 sněhuláků má kruhové posuny rozložené Fermatovou spirálou a lehký sinusový kolébavý pohyb.
   - **Prolínání řízení**: Z dálky formace míří do svých slotů; v blízkosti lovce (pod 210 px až 85 px) plynule přechází do přímého pronásledování.
   - **Breakaway Leash**: Každých 30 snímků se testuje čtverec vzdálenosti k vůdci. Při překročení limitu (např. po odhození holí či cepem) se sněhulák odpojí a trvale pronásleduje hráče.
2. **Časově krájená separace (Time-Sliced Separation)**:
   - Sousedská separace se počítá v 10snímkovém cyklu (pouze 4 sněhuláci za snímek), čímž se O(N²) redukuje na 160 jednoduchých operací na snímek. Mezi snímky se separace čte z vyrovnávací paměti.
3. **Tání a vodní louže (Water Puddle)**:
   - Sněhuláci ztrácejí 8 HP/s pasivním táním a vizuálně se zplošťují úměrně poměru zbývající Kuráže.
   - Při zániku (táním i zbraněmi) se okamžitě uvolní do fondu a na zemi se aktivuje louže na přesně 4,0 s (s odezníváním průhlednosti během poslední 1,0 s).
   - V louži má hráč 25% zpomalení (nemnoží se při překryvu více louží) a každých 0,5 s utrží nízké chladivé zranění.
4. **Kapacita a integrace Režiséra výpravy**:
   - Horda 40 sněhuláků se do efektivní kapacity bojiště (`effectiveLivingCount`) započítává souhrnně jako 4 jednotky, takže neblokuje pacingový rytmus Režiséra.
   - Režisér výpravy v taktických fázích rezervuje 4 sloty, pokud horda delší dobu neproběhla, čímž zajišťuje, že se běžné spawny ani pacingový cyklus sněhulákům nevyhýbají.
   - `tajici_snehulak` je přímo zařazen v odpoledním fondu Předjaří a preferován archetypem Tání ker.
5. **Úprava bodové hodnoty (-30 %)**:
   - Základní hodnota bodů sněhuláka byla snížena o 30 % (ze 70 na 49 b., koeficient hordy 0,35), aby odpovídala jejich hromadnému tání a vysokému počtu ve formaci.

## Důsledky
- Březnové tání získává charakteristickou, vizuálně působivou mechaniku rozbředlého sněhu a kaluží.
- Režisér i běžná hra sněhuláky aktivně nasazují v sólových i hordových vlnách.
- Běhová smyčka vykazuje 0 nových alokací a stabilní snímkovou frekvenci i při hromadném zániku všech 40 sněhuláků.
