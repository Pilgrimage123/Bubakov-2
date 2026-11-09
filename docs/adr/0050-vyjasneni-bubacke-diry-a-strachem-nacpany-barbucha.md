# Vyjasnění Bubácké díry, rituál pečetění a Strachem nacpaný Barbucha

## Kontext

Bubácká díra původně v herním enginu fungovala jako zjednodušená dočasná anomálie bez výraznější prostorové výzvy, ze které při vypršení časového limitu pouze vylezla běžná zvětšená potvora s generickým označením (*Procitlý noční hromotluk z díry*). Chyběla napínavá mechanika uvnitř pečetícího kruhu, silnější vazba na centrální herní atribut **Kuráž** a čitelný folklórní motiv strašidla rostoucího ze strachu.

## Rozhodnutí

### 1. Garantovaný výskyt v okně anomálie
Bubácká díra má deterministickou 100% pravděpodobnost výskytu právě 1× za každou Výpravu v pevném časovém okně anomálie (`anomalyWindow`, zpravidla mezi 100. a 165. sekundou podle ročního měsíce), pokud zrovna na bojišti nezuří boss. Hráčovo **Štěstí** neovlivňuje samotný spawn, nýbrž bohatost kořisti při úspěšném zapečetění.

### 2. Aktivní pečetící zóna (Větrný vír)
Pečetění vyžaduje kumulativně 4 sekundy setrvání v kruhu o poloměru 130 bodů během 15sekundového odpočtu:
- Díra generuje dostředivý větrný vír mírně stahující lovce do středu.
- Zkracuje efektivní dosvit Petrolejky uvnitř kruhu (vytváří tísnivé přítmí).
- Z hlubin díry už během odpočtu postupně vykukují svítící bázlivé oči a natahující se stínové spáry Barbuchy jako dynamický telegraf blížícího se selhání.

### 3. Strachem nacpaný Barbucha (Těžký dýmotvorný běs)
Pokud hráč díru do 15 sekund nezapečetí, díra exploduje kouřem a vystoupí z ní **Strachem nacpaný Barbucha**:
- **Původ a tělo**: Autentické strašidlo z bílo-modravého kouře (nikoliv ze sněhu) s divokou černou tušovou kšticí, mrkvovým nosem, vykulenýma očima, červenými tvářičkami a vlnícím se kouřovým ocasem.
- **Vznášení**: Beznohá kouřová entita plující vzduchem, ignorující nízké překážky na zemi (ploty, pařezy, louže).
- **Škálování strachem**: Jeho počáteční velikost a útočnost je nepřímo úměrná aktuální Kuráži lovce v okamžiku probuzení – čím větší strach (méně Kuráže) lovec má, tím je Barbucha větší (až 1,7×) a zuřivější.
- **Mechanika vyfukování**: Zásahy zbraní lovce Barbuchu postupně „vyfukují“ (zmenšují jeho měřítko až na 0,6×) a zbavují ho zuřivosti. Při každém zásahu uvolňuje obláčky kouře a sazí. Při 0 Kuráži se s komickým citoslovcem „PUF!“ neškodně rozplyne.
- **Střelba žihadel (drápy)**: Barbucha s telegrafovaným nápřahem střílí své ostré černé drápy:
  - Ve velké podobě (>50 % Kuráže): Všesměrová kruhová salva 8–10 žihadel do 360°.
  - Ve vyfouknuté podobě (≤50 % Kuráže): Směrový vějíř 5 žihadel mířených na lovce.
  - Vystřelená žihadla fungují jako přímočaré ostré projektily a nezanechávají pasti v terénu (ochrana Snímkového rozpočtu).

### 4. Rovnováha rizika a odměny
- **Úspěšné zapečetění**: Okamžitá Malovaná truhla (`POKLAD Z DÍRY!`) + 4 obří Perníčky + posvátná rázová vlna odhazující a omračující okolní běsy na 1,8 s.
- **Selhání a probuzení Barbuchy**: Truhla je ztracena v hlubinách díry; z poraženého Barbuchy padá pouze záchranná Škvarková placka na obnovu Kuráže a Perníčky. Pečetění je tedy vždy žádoucí a optimální volbou.

### 5. Procedurální ztvárnění
V souladu s vizuálním kodexem hry je Barbucha kompletně vykreslován procedurálními rutinami na Canvas 2D (kombinace ladovské kvašové kouřové vrstvy a 2,5px tušové kontury) bez jakýchkoliv externích či generovaných rastrových spritů.
