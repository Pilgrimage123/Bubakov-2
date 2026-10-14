# Architektura statu Štěstí a základní hodnoty hrdinů

## Kontext
Původní stat `luck` fungoval v enginu pouze jako skrytý pomocný koeficient pro slevu a nabídku předmětů u Čertova dědečka. Pro všechny postavy byl napevno inicializován na hodnotu `0`, neměl vliv na boj ani na kořist na bojišti a ve vesnici pro něj neexistovalo žádné obecní vylepšení. Tento stav neodpovídal folklórnímu pojetí hry ani očekávání hráčů, kde má štěstí tvořit hmatatelný archetypální atribut.

## Rozhodnutí

### 1. Kánonický termín a normalizovaná škála (Základ 100)
V doménovém modelu (GLOSSARY.md) byl zaveden oficiální termín **Štěstí** (_Avoid_: luck, štěstěna, náhoda, RNG). Škála byla sjednocena kolem průměrné hodnoty **100**, která slouží jako intuitivní základ pro výpočty procent a násobičů.

### 2. Výchozí hodnoty hrdinů (Base Stats)
Všichni hrdinové získávají v `createPlayer` a v kartách postav specifickou výchozí hodnotu Štěstí, jejíž celkový průměr napříč družinou je přesně 100:
- **Babička a Barunka: 120** (nejvyšší v celé hře – laskavost a štěstí v neštěstí)
- **Pasáček: 105** (klukovské štěstí z luk a mezí, hledání čtyřlístků)
- **Poutník: 100** (zlatý vyvážený střed)
- **Kostelník: 100** (duchovní požehnání)
- **Ponocný: 90** (spoléhá na těžkou výstroj a bdělost, ne na náhodu)
- **Bába kořenářka: 85** (racionální bylinkářka spoléhající na přesné recepty)

### 3. Třípilířový dopad na hratelnost
Stat Štěstí nově ovlivňuje tři klíčové herní subsystémy:
1. **Boj (Kritické zásahy)**: Každý bod Štěstí dává pasivní šanci na kritický úder rovnu `Štěstí × 0,1 %` (hrdina se 100 Štěstí má 10,0 % šanci, Babička 12,0 %). Běžný kritický zásah způsobí 1,65× poškození se žlutou číslicí. Kominický knoflík zůstává 100% garantovaným boostem s násobičem 2,2×.
2. **Kořist (Dropy)**: Každý bod Štěstí zvyšuje o `Štěstí × 0,1 %` šanci na povýšení perníčku o třídu výše a o `Štěstí × 0,05 %` šanci na vypadnutí krejcaru navíc z poražených běsů.
3. **Čertův dědeček**: Šance na vzácnou nabídku v nůši škáluje jako `20 % × (Štěstí / 100)`. Nákupní sleva je `Math.min(0.20, Math.max(0, (Štěstí - 80) * 0.003))`. Nákupní předmět *Podkova pro štěstí* nově přidává **+10 Štěstí** na nákup (až +50 za výpravu).

### 4. Obecní vylepšení ve Vesnici (Boží muka)
Do vesnické ekonomiky byla přidána budova **Boží muka** s 5 úrovněmi. Každá úroveň trvale přidává **+5 Štěstí** k výchozímu základu všech hrdinů (celkem až +25 při plné výstavbě) za základní cenu 50 krejcarů podléhající standardní Obecní přirážce.

## Důsledky
- Štěstí se stává plnohodnotným, všudypřítomným a srozumitelným atributem.
- Babička a Barunka získávají výraznou a unikátní herní identitu jako archetyp štěstěny a hojnosti.
- Vesnická ekonomika krejcarů nabízí další strategickou větev dlouhodobého rozvoje.
