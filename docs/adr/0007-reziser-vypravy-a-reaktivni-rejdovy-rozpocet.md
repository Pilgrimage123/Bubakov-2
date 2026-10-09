# Režisér výpravy a reaktivní rejdový rozpočet

Běžné mechanické spawnování v soustředných kruzích v Bullet Heaven hrách vede k monotónnímu kroužení po aréně, zahlcení počtem jednotek a degradaci taktického napětí. V Bubákově nahrazujeme pevné časové vlny autonomním systémem Režiséra výpravy (`RunDirector`), který hospodaří s dynamickým Rejdovým rozpočtem, monitoruje rychlost zažehnání (TTK) a míru dominance lovce, střídá fáze náporu s tichem (Oddych a Přepadení) a nasazuje strukturované bojové svazy (Kladivo a kovadlina, Architekti bojiště, Eskortní roje) namísto náhodných shluků.

## Důvody a kontext
1. **Oddělení od UI:** Podle [ADR-0002](./0002-oddeleni-herniho-enginu-od-react-ui.md) musí veškerá spawn logika opustit `App.tsx` a přejít do dedikovaného modulu `src/game/director.ts`, řízeného tickem enginu.
2. **Kvalita před kvantitou:** Při vysoké dominanci lovce Režisér nezvyšuje počet bubáků nad 75 entit (ochrana 60 FPS na canvasu), ale investuje rozpočet do odolnějších elit s nápřahy, fázováním a předsazováním trajektorie běhu lovce.
3. **Procedurální variabilita (Rozmar výpravy):** Každá výprava na stejné úrovni generuje unikátní zážitek díky trojvrstvému modelu (výchozí vylosovaný pod-archetyp úrovně, reaktivní nákupy Režiséra a situační anomálie typu Bubácká díra a Rozbroj bubáků).
4. **Férovost a pomoc lovci:** Proti-taktiky Režiséra nikdy neudělují bubákům 100% imunity. Míra reaktivity je navíc konfigurovatelná posuvníkem v nastavení a při znevýhodnění lovce systém zapojuje vyvažovací pomoc (přimíchání zranitelných bubáků a přednostní nabídka doplňkové výbavy v Dědečkově nůši).
