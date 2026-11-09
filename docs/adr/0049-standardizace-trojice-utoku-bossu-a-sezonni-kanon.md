# Standardizace trojice útoků bossů, sezónní kánon a integrace bestiáře

## Kontext

V návaznosti na audit všech 24 ročních výprav (72 bossů v kánonu od Března po Únor) a ověření bojové komplexity bylo zjištěno:
1. **Deficit bojových dovedností**: Ze 72 bossů a minibossů mělo v kódu 45 bossů méně než 3 útoky. Z nich 15 bossů (např. *Blatouchový skřítek*, *Tající sněhulák*, *Zbojník*, *Kanec kňour*, *Mikulášský čert*) nemělo vůbec žádné skriptované schopnosti a fungovalo pouze na základním kontaktním pronásledování hráče.
2. **Tematické a časové rozpory (Den vs. Noc)**:
   - Ve 3. výpravě (Dubnový den – Velikonoce) vystupovala *Stará ježibaba* a *Vrchní čarodějnice*, což odporovalo vesnickému velikonočnímu folklóru (pálení čarodějnic patří výhradně do nočního sabatu na 30. dubna ve 4. výpravě).
   - Ve 4. výpravě (Dubnová noc – Sabat) vystupoval jako Mezi-boss zámecký *Dráb*, což je denní úřední postava nesouvisející se sabatem čarodějnic.
   - Ve 14. výpravě (Září noc – Svatováclavská) docházelo k recyklaci *Bílé paní* z července a *Mlynáře* z května.
   - Ve 24. výpravě (Únor noc) figuroval *Noční kobold*, což je germánský fantasy pojem cizí ladovskému a českému folklóru.
3. **Mrtvý kód v bestiáři**: 6 plně nadefinovaných a nakreslených strašidel v `src/data/enemies.ts` a `ladaRenderer.ts` nebylo nasazeno v žádné z 24 úrovní ani jako boss, včetně velkého *Skalního obra ze Sázavy* (`obr`, 8 640 HP).

## Rozhodnutí

### 1. Odstupňovaná taktická hierarchie dovedností (Zlatý trojzubec)
Komplexita bossů je formalizována do tří stupňů:
- **Oblastní Miniboss (85 s)**: Přesně **2 telegrafované schopnosti** (např. výpad, vrh projektilu či zpomalující past s nápřahem 0.6–0.9 s a varovnou značkou). Úkolem minibosse je prověřit mobilitu hráče, nikoliv jej zahltit.
- **Oblastní Mezi-boss (185 s)**: **2 až 3 schopnosti**, z nichž alespoň jedna pracuje s prostorovou kontrolou (plošná past, zónový hazard nebo vyvolání menších poskoků).
- **Krajový Vele-boss (300 s)**: **Minimálně 3 velkolepé fázované útoky** včetně automatické zuřivosti (*Enrage*) při poklesu pod 50 % Kuráže (zvýšení rychlosti, rozšíření salv projektilů, audiovizuální bouře).

### 2. Velikonoční a sabatový kánon (Úrovně 2 a 3)
- **Úroveň 2 (Dubnový den – Velikonoce)**:
  - Miniboss (85 s): *Obří kolednický beránek* (`beranek`, beraní trk a plošný dopad).
  - Mezi-boss (185 s): **Koledující bubák** (`koledujici_bubak`, šlehnutí pletenou vrbovou pomlázkou s barevnými stuhami a vrh malovaných kraslic zanechávajících žloutkové loužičky).
  - Vele-boss (300 s): **Pan Zajíc z březového háje** (`pan_zajic`, zaječí výskok s dopadovou rázovou vlnou, koš poskakujících bouchacích kraslic a zaječí kličkování jarním osením).
- **Úroveň 3 (Dubnová noc – Filipojakubský sabat)**:
  - Miniboss (85 s): *Klekánice z mezí* (`klekanice`, zvonění klekání a sonická vlna).
  - Mezi-boss (185 s): **Černokněžník ze skal** (`cernokneznik`, uřknutí a vyvolání ohnivých diblíků namísto denního drába).
  - Vele-boss (300 s): **Vrchní Filipojakubská Čarodějnice** (`vrchni_carodejnice`, sabatové uřknutí, smolné věnce a tryskový nálet na koštěti).

### 3. Integrace 6 nevyužitých monster z bestiáře
- `obr` (Skalní obr ze Sázavy, 8 640 HP): Nasazen jako Mezi-boss v 6. úrovni (Květen noc – Zbojnická rokle u Sázavy) s autentickým vrháním a válením skalních balvanů.
- `obrneny_zbojnik`: Zařazen do bazénu těžkých běžců v 5. a 6. úrovni (Květen).
- `hromotluk`: Zařazen do stínových a nočních vln v 9. úrovni (Červenec noc).
- `zmrzlik`: Zařazen do hejn a rojí v 1. a 2. úrovni (Předjaří).
- `vanicka`: Zařazena do mrazivých běžců v 21. a 22. úrovni (Leden).
- `krvavy_rarach`: Zařazen do vyvolávání a pekelných vln v 4. a 8. úrovni (Duben a Červen noc).

### 4. Vymýcení duplicit a cizorodého názvosloví
- **Úroveň 13 (Září noc – Svatováclavská)**:
  - Nahrazení duplicitní Bílé paní za **Svatováclavského strážce** (`svatovaclavsky_strazce`, plamenný meč, štítová rázová vlna).
  - Nahrazení duplicitního Mlynáře za **Chmelového skřítka** (`chmelovy_skritek`, omamný chmelový pyl a záchytné šlahouny).
- **Úroveň 23 (Únor noc – Pochovávání basy)**:
  - Přejmenování a přepracování `nocni_kobold` na autentického českého **Masopustního laufra** (`masopustni_laufr`, řehtačkový rámus, skákání přes basu, rolničky).

### 5. Čtyřfázový postup realizace a Zákon dvojí parity
Veškeré bojové dovednosti musí být implementovány se striktní paritou mezi headless simulací (`src/game/engine.ts`) a interaktivním vykreslováním (`src/App.tsx`), ověřeny automatickými unit testy v `tests/bossTacticsAndComplexity.test.ts` a realizovány ve 4 etapách:
1. **Etapa 1 (Jaro – Úrovně 0–5)**: Velikonoce, `koledujici_bubak`, `pan_zajic`, sabat v Lvl 3, Skalní obr v Lvl 5.
2. **Etapa 2 (Léto – Úrovně 6–11)**: Čert sekáč, Vele-rak, Rusalka, Královský čmelák, Zlatohlávek.
3. **Etapa 3 (Podzim – Úrovně 12–17)**: Svatováclavský strážce, Chmelový skřítek, Černý myslivec, Divoký kňour.
4. **Etapa 4 (Zima – Úrovně 18–23)**: Masopustní laufr, Vládce chumelenice, Obří sněhulák, Rychtář masek.
