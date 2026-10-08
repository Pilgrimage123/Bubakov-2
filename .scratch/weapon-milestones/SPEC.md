# Specifikace: Interaktivní Milníky zbraní (Weapon Milestones)

## Problem Statement

Lovec v průběhu výpravy vylepšuje své zbraně nákupem v Dědečkově nůši nebo otevíráním Malovaných truhel. Přestože herní data obsahují definice 90 unikátních větví pro Milníky zbraní (na 3., 5. a 8. Hodnosti zbraně), lovec v současnosti nemá žádnou možnost si mezi těmito větvemi vybrat. Hra při dosažení milníkové hodnosti tiše a automaticky přiřadí vždy první možnost (plošnou variantu), druhá větev (průrazná / razantní) je v reálné hře zcela nedostupná a lovec o existenci milníků v uživatelském rozhraní vůbec neví.

## Solution

Zpřístupnit systém Milníků zbraní jako plnohodnotnou interaktivní mechaniku pro lovce:
1. Při povýšení zbraně na 3., 5. nebo 8. Hodnost zbraně (v Dědečkově nůši i z Malované truhly) se lovci zobrazí folklórní výběrové okno se dvěma tematickými větvemi milníku.
2. Každá volba přehledně zobrazí svůj název, popis a statistické bonusy (např. dodatečné projektily, prodloužení omráčení, odhození, průraz).
3. Vybraná větev se uloží k dané zbrani a okamžitě se projeví v chování zbraně v boji proti bubákům.
4. Stav aktivních milníků zbraní je viditelný na kartách zbraní v uživatelském rozhraní a v Dědečkově nůši.

## User Stories

1. Jako lovec chci být při dosažení 3. Hodnosti zbraně vyzván k volbě milníku, abych mohl přizpůsobit styl boje aktuální situaci na výpravě.
2. Jako lovec chci být při dosažení 5. Hodnosti zbraně vyzván k volbě druhého milníku, abych dále prohloubil specializaci své zbraně.
3. Jako lovec chci být při dosažení 8. Hodnosti zbraně vyzván k volbě finálního milníku, abych získal vrcholnou podobu své zbraně pro noční boj s nejtěžšími bubáky.
4. Jako lovec chci v nabídce volby vidět folklórní názvy a popisy obou větví v češtině i angličtině, aby odpovídaly ladovské atmosféře hry.
5. Jako lovec chci u každé volby milníku vidět konkrétní bonusy k vlastnostem (např. +1 projektil, +25 % odhození), abych mohl učinit informované rozhodnutí.
6. Jako lovec chci mít možnost zvolit jak první (plošnou), tak druhou (razantní / bodovou) větev, aby nebyla jedna větev trvale uzamčená.
7. Jako lovec chci, aby se zvolený milník ihned projevil při dalším úderu zbraně bez nutnosti restartovat hru nebo měnit zbraň.
8. Jako lovec chci v Dědečkově nůši u položky zbraně jasně vidět, zda další nákup představuje milníkovou hodnost, abych mohl lépe plánovat útratu krejcarů.
9. Jako lovec chci, aby při získání milníkového povýšení z Malované truhly hra otevřela volbu milníku ihned po dokončení losování odměn.
10. Jako lovec chci na ikonách svých zbraní ve spodní liště vidět označení aktivovaných milníků (např. římské číslice nebo hvězdy), abych měl přehled o stavu své výbavy.
11. Jako lovec chci při najetí myší na zbraň v liště vidět přehled již vybraných milníků a jejich efektů.
12. Jako lovec chci slyšet specifický zvukový doprovod při potvrzení volby milníku, aby měla volba patřičnou váhu.
13. Jako hráč se starší uloženou pozicí chci, aby hra bez pádu načetla dříve uložené zbraně a bezpečně doplnila výchozí milníky pouze u těch zbraní, kde volba dosud neproběhla.

## Implementation Decisions

- **Správa čekající volby v herním enginu**: Do stavu `GameEngine` bude přidána fronta či stav `pendingMilestoneChoice`. Pokud povýšení zbraně dosáhne hodnosti 3, 5 nebo 8 a milník pro tuto hodnost dosud nebyl vybrán, engine pozastaví bojovou smyčku a předá informaci prezentační vrstvě.
- **Odstranění tichého automatického přiřazování**: Funkce pro ověření milníků (`ensureWeaponMilestones`) bude upravena tak, aby nesloužila jako automatický předvýběr první větve během aktivní hry, ale pouze jako záchranná migrace pro zpětnou kompatibilitu načítaných profilů či testů.
- **Prezentační komponenta dialogu volby**: Bude vytvořena samostatná komponenta dialogu laděná do ladovského stylu (`WeaponMilestoneModal`), která zobrazí dvě karty větví milníku získané z existujících datových definic a lokalizačního modulu.
- **Integrace s Dědečkovou nůší a truhlami**:
  - Pokud je zbraň povýšena v nůši na milníkovou hodnost, nůše nabídne výběr větve jako součást transakce.
  - Pokud je zbraň povýšena v truhle, dialog volby se aktivuje po zavření truhly.
- **Zobrazení na kartě zbraně v nůši**: Karta zbraně v nůši na hodnostech 2, 4 a 7 nahradí generický text `+12 % zranění...` zřetelným upozorněním na blížící se křižovatku rozvoje zbraně.
- **Zachování kanonických identifikátorů**: Identifikátory všech 15 zbraní striktně zachovávají snake_case formát dle ADR 0001.
- **Využití stávajících datových struktur**: Specifikace přímo využívá již existujících 90 milníkových definic a jejich překladových klíčů bez nutnosti měnit strukturu bojových statistik.

## Testing Decisions

- **Charakteristika kvalitního testu**: Testy musí ověřovat vnější chování a stav enginu skrze veřejné rozhraní `GameEngine`, nikoliv interní pomocné implementační detaily React komponent.
- **Testované oblasti a scénáře**:
  - Povýšení zbraně na hodnost 2 nevytváří požadavek na volbu milníku.
  - Povýšení zbraně na hodnost 3, 5 a 8 vytváří odpovídající `pendingMilestoneChoice` s přesně dvěma možnostmi.
  - Volba druhé větve (např. `burst`) uloží správné ID do `w.milestones` a po výpočtu `getRankedWeaponStats` vykáže odlišné statistiky než volba první větve (`crowd`).
  - Bojová smyčka enginu aplikuje modifikátory vybrané větve na generované projektily či plošné údery.
  - Migrace starých uložení zůstává plně funkční a nezpůsobuje výjimky.

## Out of Scope

- Tvorba nových zbraní nad rámec 15 kanonických zbraní.
- Změna celkového počtu hodností zbraní (zůstává fixně 8 hodností).
- Možnost resetovat nebo převolovat vybraný milník v průběhu téže výpravy.
- Implementace dedikovaných animací pro `visualEffectTag`, které zatím nemají grafické podklady.
