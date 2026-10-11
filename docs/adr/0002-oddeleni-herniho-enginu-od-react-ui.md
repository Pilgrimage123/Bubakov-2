# Oddělení herního enginu od React UI vrstvy

V souboru `App.tsx` bylo soustředěno přes 9 200 řádků kódu míchajících React stav, 60 FPS herní smyčku, fyziku, particle systém a UI overlaye. Rozhodli jsme se oddělit čistou herní logiku do bezhlavého modulu `GameEngine` v `src/game/engine.ts`, který přímo spravuje herní entitní stav, spatial hash, projektily a fyzikální výpočty na Canvasu bez React re-renderů. React vrstva v `App.tsx` zůstane čistou prezentační a stavovou skořápkou pro přepínání obrazovek (menu, výběr lovce, vesnice, Dědečkova nůše) a předávání uživatelských vstupů.
