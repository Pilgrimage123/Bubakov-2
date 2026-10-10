# Ladovské kvašové svícení a kompozitní vrstva světla

## Kontext
Tradiční dynamické osvětlení s plynulými shadery, digitálním bloomem a přepočtem stovek radiálních přechodů každý snímek odporuje pohádkovému výtvarnému stylu Josefa Lady (kvaš, tušové kontury, dřevoryt) a ohrožuje rozpočet 60 FPS stanovený v ADR 0002. Současně herní mechaniky (Stínová záštita Bubáka, reakce na denní fáze) vyžadují přesnou informaci o úrovni osvětlení.

## Rozhodnutí
Zavádíme architekturu dvoustupňového Ladovského svícení. Simulační pravidla (dosah Petrolejky podle Kuráže, světelné zóny a rozpad Stínové záštity Bubáka) jsou počítána deterministicky v `GameEngine` pomocí prostorového indexu (`SpatialHash`). Vizuální prezentace probíhá přes vyhrazené kompozitní plátno (Offscreen Light Canvas) s předrenderovanými kvašovými stupni (3–4 tonální pásy) a tušovým tečkováním na obvodu. Inverze siluet při svěcení a blescích se provádí záměnou palety kontur vykreslovaných entit v `ladaRenderer.ts`.

## Důsledky
Hra získává nezaměnitelný pohádkový vzhled knižní ilustrace a plně funkční hratelnost světla a stínu při nulovém riziku propadu snímkové frekvence na 2D Canvasu.
