# 01: Datový model a aplikace synergických variant běžných upgradů v herním enginu

**What to build:** Herní engine podporuje evidenci a výpočet synergických variant běžných povýšení zbraně (hodnosti 2, 4, 6, 7). Zbraň může mít aplikované specifické synergické profily s reálnými trade-offy (např. výrazný nárůst počtu projektilů kompenzovaný snížením poškození, nebo vysoký bonus k poškození vykoupený delší přípravou útoku), které se okamžitě projevují v bojových statistikách i chování zbraně bez narušení existujících milníků (hodnosti 3, 5, 8).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Stav zbraně uchovává historii zvolených synergických profilů pro ne-milníkové hodnosti se zachováním zpětné kompatibility uložených pozic.
- [x] Funkce výpočtu bojových statistik zbraně zohledňuje aplikované synergické modifikátory (multiplikátory projektilů, poškození, dosahu a cooldownu).
- [x] Systém milníků na 3., 5. a 8. hodnosti zůstává plně oddělený a zachovává své nezávislé volby.
- [x] Jednotkové testy ověřují přesnost výpočtu statistik zbraně při aplikaci synergických profilů s trade-offy.
