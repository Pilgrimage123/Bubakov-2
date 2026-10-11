# Vybalancování elitních prefixů bubáků a anti-kiting systém

Komplexní plán na herní vybalancování 4 unikátních prefixů elitních bubáků nasazovaných Režisérem výpravy (`RunDirector`), zavedení 91% redukce poškození a imunit Kamenného bubáka, bleskové odvety Hromového bubáka do 200 px a zavedení trojité anti-kiting mechaniky Pekelného bubáka (magmatické stopy, predátorský sprint a prediktivní sopečné trhliny).

---

## Uživatelské volby a potvrzená rozhodnutí

> [!IMPORTANT]
> Na základě uživatelských požadavků a vyjasňujícího dotazníku jsou potvrzeny následující herní mechaniky:

- **Nezvětšené dropy pro všechny prefixy**: Všichni prefixovaní bubáci (`vichricovy`, `kamenny`, `hromovy`, `pekelny`) mají standardní odměny a dropy shodné s běžnými bubáky daného druhu (žádné minibossí násobení bodů či dropů).
- **Kamenný bubák (Neproniknutelný kolos)**:
  - Redukce poškození: **91 %** (přijímá pouze 9 % zranění).
  - Rychlost pohybu: **-20 %** z báze.
  - Imunita proti omráčení: 100% imunita proti klasickému stunu i pseudoomráčení ze svačin (např. Buchty / koláče).
  - Masivní odolnost proti odhození (knokback resist 0.15×).
- **Hromový bubák (Blesková odveta)**:
  - Bleskový odraz (retaliation thorns): Při zásahu hráčem do vzdálenosti **200 px** okamžitě vrátí hráči **50 % uděleného poškození** formou bleskového oblouku.
  - Zvýšená rychlost pohybu a agresivní útoky.
- **Pekelný bubák (Anti-Kite predátor - syntéza 3 inspirací)**:
  - **1. Trvalá magmatická stopa (Track Denier)**: Pekelný bubák za sebou při pohybu zanechává hořící louže lávy (trvající 8–10 sekund), které blokují oblíbené kruhové kiting smyčky kolem arény.
  - **2. Predátorský hon (Predatory Stalk)**: Pokud se hráč zdržuje ve vzdálenosti > 220 px, Pekelný bubák nabírá každou sekundu +15 % rychlosti (až do +120 % maxima). Přiblížení na tělo (< 120 px) nebo zásah na blízko tento bonus resetuje.
  - **3. Prediktivní vulkanická erupce (Trajectory Interceptor)**: Pokud hráč nepřetržitě utíká přímočaře déle než 2,5 sekundy, Pekelný bubák vyvolá varovnou sopečnou puklinu 200–250 px před běžícím hráčem na jeho vektoru pohybu, nutící hráče k prudkému úhybu o 90°.

---

## 1. Přehled a herní koncept

### Cíl rozšíření
Běžné kiting strategie (neustálé couvání a kroužení po okraji mapy za pasivního kropení nepřátel zbraněmi) jsou v bullet-heaven / survivor hrách často dominantní a triviální. Cílem je dát Režisérovi (`RunDirector`) nástroj v podobě 4 diametrálně odlišných taktických výzev:

1. **💨 Vichřicový**: Extrémní hbitost (+110 speed) a 50% šance na úhyb (`MINUL! 💨`).
2. **🪨 Kamenný**: Nezastavitelná zeď s 91% redukcí zranění, imunitou na omráčení a svačinové uklidnění, která ignoruje knockback a pomalu, ale neúprosně tlačí hráče do kouta.
3. **⚡ Hromový**: Trestá střelbu na krátkou až střední vzdálenost (< 200 px) – hráč musí držet distanc, jinak utrpí 50% bleskový protiúder.
4. **🔥 Pekelný**: Ultimátní anti-kiter – trestá hráče, kteří utíkají daleko (zrychluje), běhají v kruzích (pálí je stopa) nebo běží v přímce (odřízne je erupce).

---

## 2. Uživatelský zážitek a vizuální styl

Všechny vizuální a grafické prvky striktně ctí lidovou pohádkovou gouache estetiku Josefa Lady:

- **Kamenný bubák**:
  - Hrubá břidlicová aura s rotujícími zemitými oblázky.
  - Textový efekt `ODRAŽENO! 🪨` při pokusu o omráčení buchtou.
  - Zvuk tupého kamenného dopadu při absorpci 91 % zranění.
- **Hromový bubák**:
  - Praskající modro-zlatý bleskový oblouk spojující bubáka a hráče při aktivaci odvety do 200 px.
  - Zvuk hromového prasknutí a zobrazení čísla odraženého poškození.
- **Pekelný bubák**:
  - **Magmatické stopy**: Plošky doutnajícího uhlí a žhavé lávy kreslené kvašovou texturou s plamínky stoupajícími vzhůru.
  - **Predátorský sprint**: Zintenzivňující se rudá aura a stopa ohně za běžícím bubákem, jak nabírá rychlost.
  - **Prediktivní puklina**: Kouřící trhlina v zemi s praskající zeminou, která po 1,2 s vybuchne ohnivým gejzírem.

---

## 3. Klíčová produktová rozhodnutí a herní rovnováha

### Rozhodnutí 1: Standardní dropy pro všechny prefixy
- **Zvolený přístup**: Žádný prefixovaný bubák nezvyšuje množství jitrnic, bodů ani dropů. Odměnou za přežití je samotný postup a eliminace nebezpečí.
- **Proč**: Zabraňuje "farming exploitům", kdy by hráč záměrně nechával Režiséra generovat těžké bubáky pro snadné získání zdrojů, a přesně odpovídá požadavku uživatele.

### Rozhodnutí 2: Trojitá anti-kiting kompozice u Pekelného bubáka
- **Zvolený přístup**: Pekelný bubák kombinuje 3 mechaniky z vyjasňovacího zadání:
  - Zakázání staré stopy (magmatická stopa).
  - Trest za zbabělý útěk do dálky (predátorské zrychlení).
  - Narušení přímého úprku (prediktivní erupce před hráčem).
- **Proč**: Jednotlivá mechanika by šla snadno obejít, ale tato trojice nutí hráče hrát aktivně, měnit směry, přibližovat se a řešit střety čelem.

### Rozhodnutí 3: Hromový bleskový odraz do 200 px
- **Zvolený přístup**: Poškození se vrací hráči pouze, pokud je hráč v okruhu 200 px od bubáka v okamžiku dopadu zásahu.
- **Proč**: Vytváří přirozený protipól k Pekelnému bubákovi. Proti Pekelnému se hráč musí přiblížit nebo manévrovat, zatímco proti Hromovému musí zachovat odstup a nestřílet z bezprostřední blízkosti.

---

## 4. Technická architektura a realizace

### Systémový diagram interakcí

```
┌───────────────────────────────────────────────────────────────┐
│                    RunDirector (Taktika)                     │
│  Nasazuje prefixované bubáky při rychlé likvidaci a rozpočtu  │
└──────────────────────────────┬────────────────────────────────┘
                               │ spawnuje s prefixem
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                      Enemy Instance                           │
│  - prefix: 'vichricovy' | 'kamenny' | 'hromovy' | 'pekelny'   │
│  - prefixDamageReduction: 0.91 (kamenny)                      │
│  - immuneToStun & immuneToSnackStun: true (kamenny)           │
│  - speedModifier: 0.8 (kamenny)                               │
│  - thornsDist: 200, thornsRatio: 0.5 (hromovy)                │
│  - stalkTimer, magmaTrailTimer, fissureTimer (pekelny)        │
└───────┬───────────────────────────────┬───────────────────────┘
        │                               │
        ▼ (při zásahu hráče)            ▼ (v update loopu)
┌───────────────────────────────┐ ┌─────────────────────────────┐
│    takeDamage Handlery        │ │     Herní simulace          │
│ • Vichřicový: 50% dodge       │ │ • Pekelný: Magma louže      │
│ • Kamenný: 91% redukce &      │ │ • Pekelný: Stalk speed buff │
│   ignorování stunu/snacku     │ │ • Pekelný: Erupce před      │
│ • Hromový: 50% lightning zap  │ │   hráčem na predikci vektoru│
│   zpět hráči do 200 px        │ │ • Vykreslení Ladových aur   │
└───────────────────────────────┘ └─────────────────────────────┘
```

### Konkrétní kroky implementace:

1. **Typy (`src/types.ts`)**:
   - Aktualizace `ENEMY_PREFIX_DEFS`:
     - `kamenny`: `damageReduction: 0.91`, `speedMultiplier: 0.8`, `immuneToStun: true`, `immuneToSnackStun: true`.
     - `hromovy`: `thornsReflectRatio: 0.5`, `thornsRange: 200`.
     - `pekelny`: `magmaTrail: true`, `predatoryStalk: true`, `predictiveEruption: true`.
   - Rozšíření stavu instance nepřátel o sledování pozic magmatických stop a erupcí.

2. **Herní jádro & bojové metody (`src/App.tsx` & `src/game/engine.ts`)**:
   - V `takeDamage`:
     - Zajištění 91% redukce poškození pro Kamenného bubáka.
     - Blokování stunů a snack-pacifikace (buchty) u Kamenného bubáka.
     - Blesková odveta u Hromového bubáka: Pokud `dist <= 200`, hráč obdrží `amount * 0.5` zranění se zobrazením blesku a číselného zranění hráče.
   - V `update` cyklu:
     - Pekelný bubák: Generování zón magmatické stopy (hazardy ubírající hráči zdraví při kontaktu).
     - Predátorský sprint: Zvyšování rychlosti Pekelného bubáka při `distance > 220 px`, reset při zásahu na blízko nebo přiblížení hráče.
     - Prediktivní puklina: Detekce rovného běhu hráče, vytvoření varovného kruhu před hráčem a následná exploze.

3. **Vizuální vykreslování (`src/render/ladaRenderer.ts`)**:
   - Vykreslení magmatických louží a sopečných puklin v ladovském kvašovém stylu.
   - Vykreslení bleskového výboje z Hromového bubáka do hráče při odrazu poškození.
   - Vykreslení štítu a nulového omráčení u Kamenného bubáka.

4. **Verifikace a testy (`tests/enemyPrefixes.test.ts`)**:
   - Rozšíření jednotkových testů o ověření 91% redukce poškození, imunity vůči omráčení a svačinám u Kamenného bubáka, odrazu poškození u Hromového bubáka a anti-kiting mechanismů u Pekelného bubáka.
   - Spuštění kompletní sady testů a linteru.
