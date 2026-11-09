# 02: Polarita 10% akcentní palety a morfologie střel (Oblé vs. Špičaté)

**What to build:** Striktní oddělení polarity barev a tvarů projektilů podle ADR 0045 a ADR 0046. Střely lovce (buchty, knedlíky, kapky piva, šišky) mají výhradně oblé organické siluety v kobaltové modři `#1E56A0` a lipové zeleni se světlým jádrem. Střely strašidel (čertovské vidle, trny, střepy, plamínky) mají výhradně agresivní špičatou geometrii v rumělkově červené `#E62A19` se sírově žlutým středem. Hráč periferním viděním okamžitě a bezpečně rozpozná nebezpečí od vlastních útoků.

**Blocked by:** 01: Dvouúrovňová kaligrafická linka a ochrana siluet hordy před černou kaší

**Status:** closed

- [x] Přepracovat procedurální vykreslování v `src/render/renderProjectiles.ts` tak, aby všechny projektily lovce používaly zaoblené tvary a modrozelenou akcentní paletu.
- [x] Upravit nepřátelské projektily na agresivní špičaté geometrie s rumělkovou konturou `#E62A19` a žhavým sírovým středem.
- [x] Odstranit jakékoliv zlaté a sytě žluté zbarvení z nepřátelských střel (vyhrazeno pro Perníčky a odměny).
- [x] Ověřit kontrast a okamžitou rozlišitelnost při křížení desítek projektilů obou stran na scéně.
- [x] Zkontrolovat testy zbraňových projektilů a vizuálního enginu.
