# 04: Pampeliškové chmýří – větrný dělící se nepřítel

**What to build:** The player faces Pampeliškové chmýří (Dandelion Sprites), sentient smiling puffs of dandelion seeds that drift passively along the arena's wind currents. When struck with melee strikes or non-piercing projectiles, each puff splits into three faster, smaller dandelion seedlets before dissipating; piercing or area attacks disperse them cleanly in a single blow.

**Blocked by:** 01: Definice 5. úrovně (Květen v Hrusicích) a postup hrou

**Status:** closed

- [x] Enemy archetype `pampeliska_chmyri` is registered with baseline movement, wind velocity adherence, and low baseline health.
- [x] Hit-reaction logic checks incoming weapon properties: melee and non-piercing impacts trigger a 3-way split into mini-seedlets (`pampeliska_chmyricko`) inheriting tangential velocities.
- [x] Piercing, explosive, and sweeping attacks bypass splitting and destroy the dandelion sprite instantly.
- [x] Procedural vector rendering renders radiating white seed bristles surrounding a playful, smiling Ladovský face.
- [x] Integrated into Stage 5 wave director spawn pools across open meadow and pasture encounters.
- [x] Unit tests verify wind movement kinematics, attack type damage discrimination, splitting count, and state lifecycle.
