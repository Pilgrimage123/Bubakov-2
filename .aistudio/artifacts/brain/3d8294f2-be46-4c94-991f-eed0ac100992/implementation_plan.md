# Integrace Úrovně 0 (Předjaří v Hrusicích) do Hlavního Menu

Kompletní zapojení Úrovně 0 (Předjaří) do obrazovky výběru výprav jako první karty před Úrovní 1, nastavení jako výchozí volby pro nového hráče a ošetření nulové hodnoty v celém stavu aplikace.

## Uživatelská rozhodnutí a schválené preference

> [!IMPORTANT]
> Následující rozhodnutí byla potvrzena uživatelem v 1. fázi dotazování:
> - **Umístění karty:** Vložit Úroveň 0 jako první kartu v mřížce před Úroveň 1 (seznam všech 7 úrovní 0–6).
> - **Výchozí volba:** Úroveň 0 bude výchozí předvybranou výpravou pro nové hráče jako doporučený úvod.

---

## 1. Přehled a hlavní cíl

Úroveň 0 (*Předjaří v Hrusicích*) byla do datových struktur (`levels.ts`, `levelUnlocks.ts`, `runArchetypes.ts`, testy) již přidána, avšak v uživatelském rozhraní `App.tsx` nebyla viditelná z těchto technických důvodů:
1. Mřížka karet v hlavním menu iterovala pouze fixní pole `[1, 2, 3, 4, 5, 6]`.
2. Mapování postupu úrovní `levelProgress` vynechávalo ID `0`.
3. Validace stavu `selectedLevelId` a fallbacky používaly `s >= 1 && s <= 6` a operátor `|| 1`, které pro falsy hodnotu `0` vždy vracely `1`.

Cílem je plně otevřít Úroveň 0 v nabídce, umožnit její přímé spuštění, vizualizaci odznaků, postupu a zobrazení jarního ladovského motivu.

---

## 2. Uživatelské rozhraní a vizuální podoba (UX & Design)

```
┌────────────────────────────────────────────────────────────────────────┐
│                      VÝBĚR VÝPRAVY (STAGE SELECT)                      │
│                                                                        │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│ │ 🌱 Úroveň 0  │ │ 🍂 Úroveň 1  │ │ 🌲 Úroveň 2  │ │ ❄️ Úroveň 3  │   │
│ │ Předjaří     │ │ Náves        │ │ Hřbitov      │ │ Zima         │   │
│ │ [Začátečník] │ │ [Výchozí]    │ │ [Postup]     │ │ [Postup]     │   │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                     │
│ │ 🌊 Úroveň 4  │ │ 👻 Úroveň 5  │ │ 🐉 Úroveň 6  │                     │
│ │ Hamry        │ │ Hláska       │ │ Dračí sluj   │                     │
│ └──────────────┘ └──────────────┘ └──────────────┘                     │
└────────────────────────────────────────────────────────────────────────┘
```

- **První karta v mřížce (Úroveň 0):**
  - Ikona: 🌱 (*Předjaří v Hrusicích*)
  - Odznak: `Začátečnická úroveň`
  - Vizuální styl: Ladovské jarní blankytné tóny (`#D6EAF8`), tající kry, zelenající se meze.
  - Stav odemčení: Zelené odemčené záhlaví, ihned přístupné.
- **Responzivní mřížka:**
  - Mřížka `level-grid` pojme všech 7 karet přirozeně (ve 3–4 sloupcích na desktopu, 2 na tabletu, 1 na mobilu).
- **Detaily a volba výpravy:**
  - Kliknutím na kartu Předjaří se nastaví `selectedLevelId = 0`.
  - V pravém / spodním sumáři výpravy se zobrazí jarní náhled, boss *Vodník z tajících ker* a varování před probuzenou žábou.
  - Tlačítko *"Vyrazit na výpravu"* spouští engine přímo s `levelId: 0`.

---

## 3. Klíčová rozhodnutí a architektura změn

- **Náhrada `|| 1` za bezpečné nullish operátory (`??`):**
  - V JavaScriptu je `0` vyhodnoceno jako nepravda. Kód jako `levelId || 1` nebo `s && s >= 1` proto mění ID 0 na 1.
  - Úprava stavu:
    ```typescript
    const [selectedLevelId, setSelectedLevelId] = useState<GameLevelId>(() => {
      const s = meta.selectedLevel;
      return (typeof s === 'number' && s >= 0 && s <= 6 ? s : 0) as GameLevelId;
    });
    ```
  - Mapování postupu:
    ```typescript
    const levelProgress = Object.fromEntries(
      LEVEL_ORDER.map((id) => [id, getLevelProgress(id, meta)])
    ) as Record<GameLevelId, LevelProgress>;
    ```
- **Konzistence postupu po vítězství (Tally Screen):**
  - Pokud hráč pokoří Úroveň 0, tlačítko *"Vyrazit do další úrovně"* nabídne přechod do Úrovně 1 (Náves a rybník Brčálník).
  - Stav dokončení `meta.completedLevels[0]` a poražení bosse Hastrmana korektně označí Předjaří zlatým věncem / odznakem splnění.

---

## 4. Technický diagram toku dat

```
                   ┌──────────────────────────────────────┐
                   │    Uložený stav meta.selectedLevel   │
                   └──────────────────┬───────────────────┘
                                      │ (0 ?? výchozí 0)
                                      ▼
                   ┌──────────────────────────────────────┐
                   │        selectedLevelId: 0..6         │
                   └──────────────────┬───────────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
┌────────────────────────┐                             ┌────────────────────────┐
│ UI: Mřížka level-grid  │                             │ Engine: initRun        │
│ Vykreslení karet [0..6]│                             │ levelId: 0 (Předjaří)  │
│ 0 = Předjaří (vybráno) │                             │ Jarní kry, žáby, boss  │
└────────────────────────┘                             └────────────────────────┘
```

---

## 5. Plán realizace

1. **Úprava `App.tsx`:**
   - Přidat `0` do iterace úrovní v mřížce (`LEVEL_ORDER` nebo `[0, 1, 2, 3, 4, 5, 6]`).
   - Upravit inicializaci `selectedLevelId` tak, aby výchozí byla hodnota `0` pro nové hráče a hodnota `0` nebyla přepisována na `1`.
   - Zahrnout `0` do mapování `levelProgress`.
   - Aktualizovat podmínky pro spuštění hry (`chosenLevelId: targetLevelId ?? selectedLevelId ?? 0`).
   - Aktualizovat zobrazení splněné úrovně (`isCompleted`) pro Úroveň 0 (kontrola `meta.bestiaryKills?.hastrman` nebo `completedLevels[0]`).
2. **Ověření a kompilace:**
   - Spustit Vitest testy (`npx vitest run`).
   - Spustit `compile_applet` pro ověření bezchybného buildu.
