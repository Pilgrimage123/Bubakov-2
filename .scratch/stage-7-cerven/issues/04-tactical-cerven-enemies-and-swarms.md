# 04: Taktická červnová havěť a 2 nová hejna (+200 % obtížnost)

**What to build:** The player faces a lethal summer bestiary calibrated to +200% difficulty over Stage 1 (3x stats), completely devoid of undead. Includes the river crayfish with deflecting front carapace, the woodland blueberry imp throwing sticky slowing berries, two new distinct swarms derived from existing enemies (the field mice swarm bursting from haystacks at blinding speed, and the pekelný soot-devil swarm erupting from heat mirages with burning embers), combined with tactical waves of devils and Polednice in the blistering heat.

**Blocked by:** 01: Definice 7. výpravy (Červen v Hrusicích) a postup hrou

**Status:** closed

- [x] River crayfish (`rak_ricni`) enemy introduced: high durability, deflects frontal attacks requiring flanking maneuvers, and delivers sharp pincer thrusts near waterways.
- [x] Blueberry imp (`boruvkovy_diblik`) enemy introduced: keeps distance in forest areas, lobbing blueberry projectiles that create lingering slow puddles.
- [x] Swarm 1: Field mice swarm (`roj_polnich_mysaku` derived from `mysak`) introduced: high spawn density, blistering speed (145+), darting swarm AI that bursts from haystacks to encircle the player.
- [x] Swarm 2: Soot devil swarm (`pekelny_roj_sazovniku` derived from `rarach`/`sazovy_rarach`) introduced: fiery imp swarm spitting sparks and bursting into burning embers upon defeat.
- [x] Devil support units (`pekelny_cert`, `certik`, `pekelny_drab`) and field `polednice` are integrated into afternoon heat waves.
- [x] Undead entities (skeletons, ghouls, Bílá paní, Bezhlavý rytíř) are completely purged from all spawn pools.
- [x] Enemy combat stats, speed, poise, and experience drop values are calibrated to +200% over Stage 1.
- [x] Unit tests verify enemy registration, swarm behaviors, deflection mechanics, and spawn pool compositions.
