export type SupportedLang = 'cs' | 'en';

export const csDict: Record<string, string> = {
  // UI texts
  'ui.play': 'Hrát',
  'ui.test_mode': '🧪 Testovací mód',
  'ui.reset_progress': '🗑️ Vymazat postup',
  'ui.controls': '🎮 Ovládání hry',
  'ui.bestiary': '📖 Bestiář nočního venkova',
  'ui.arsenal': '🗡️ Zbrojnice',
  'ui.plan': '📜 Plán změn a kronika',
  'ui.village': '🏘️ Vesnice & Hospoda',
  'ui.step1': '🗺️ KROK 1 ZE 2: VÝBĚR VÝPRAVY',
  'ui.step2': '🏹 KROK 2 ZE 2: VÝBĚR LOVCE',
  'ui.proceed_to_hunter': 'Pokračovat k výběru lovce ➔',
  'ui.back_to_stages': '⬅ Zpět k výběru výpravy',
  'ui.start_expedition': 'Vyrazit na výpravu! ➔',
  'ui.language': 'Jazyk',
  'ui.lang_cs': '🇨🇿 Čeština',
  'ui.lang_en': '🇬🇧 English',
  'ui.close': 'Zavřít',
  'ui.upgrade': 'Vylepšit',
  'ui.unlocked': 'Odemčeno',
  'ui.locked': 'Uzamčeno',
  'ui.pause': 'Pozastavit hru',
  'ui.resume': 'Pokračovat ve hře',
  'ui.restart': 'Zkusit znovu',
  'ui.victory': 'Vítězství!',
  'ui.defeat': 'Konec výpravy',

  // 15 Weapons: name & desc
  'weapon.osikovy_prut.name': 'Osikový prut',
  'weapon.osikovy_prut.desc': 'Ohebný osikový prut s pupeny uříznutý v osikovém háji. Rychlý široký sečný oblouk razantně odhání dotěrné skřítky a zloděje. S kapkou rybniční vody získáte Mokrý prut.',

  'weapon.valecnice.name': 'Válečnice',
  'weapon.valecnice.desc': 'Rázná venkovská paní s bukovým válečkem (+40 % velikost). Obíhá lovce ve velkém kruhu (115 px), má dosah 58 px, udílí 1,2s omráčení, důrazné odhození (520) a ignoruje 20 % odolností. V zóně o 15 % větší než orbit navíc zpomaluje nepřátele o 25 % (odolnost dle Vůle).',

  'weapon.cesnekova_topinka.name': 'Česneková topinka',
  'weapon.cesnekova_topinka.desc': 'Smradlavá a štiplavá aura z česnekové topinky. Zraňuje dotírající nepřátele v okruhu 110 px, odhazuje je a zpomaluje o 15 %.',

  'weapon.kysela_okurka.name': 'Kyselá okurka',
  'weapon.kysela_okurka.desc': 'Střílí kyselé okurky. Kdo se jich přejí, zezelená, zeslábne a začne dostávat větší rány.',

  'weapon.povidlove_buchty.name': 'Povidlové buchty',
  'weapon.povidlove_buchty.desc': 'Zlatavé kynuté české buchty pečené v pekáči, sypané jemným cukrem a plněné povidly. Nezpůsobují odhození ani grafický zásah, ale bubáci se na 1,8 s zastaví a mlsají s poznámkou „Ňam, ňam“. S vyšší úrovní přibývají další buchty v salvě (odolnost dle Hladu).',

  'weapon.kovarske_vidle.name': 'Kovářské vidle',
  'weapon.kovarske_vidle.desc': 'Třízubé kované vidle z vesnické kovárny. Proráží řady strašidel mocným bodnutím přímo vpřed.',

  'weapon.kovana_halapartna.name': 'Kovaná halapartna',
  'weapon.kovana_halapartna.desc': 'Těžká zbraň ponocných a panských drábů. Široký rázný švih, který spolehlivě zažene i celé houfy kostlivců.',

  'weapon.dreveny_cep.name': 'Dřevěný cep na obilí',
  'weapon.dreveny_cep.desc': 'Okovaný venkovský cep na mlácení žita. Drtivý dopad do země vyvolá rázovou vlnu a odhodí těžké nepřátele.',

  'weapon.devatero_kviti.name': 'Devatery kvítí',
  'weapon.devatero_kviti.desc': 'Voňavý ochranný věnec z bylin natrhaných o svatojánské noci. Šíří se v kruhu, čistí vzduch a zahání dotírající nečisté síly.',

  'weapon.snehova_koule.name': 'Sněhová koule',
  'weapon.snehova_koule.desc': 'Tuhá ledová koule uválená ze zledovatělého ladovského sněhu. Chlad zpomalí nohy každému strašidlu.',

  'weapon.kynuty_kolac.name': 'Kynutý koláč',
  'weapon.kynuty_kolac.desc': 'Tradiční slavnostní kynutý koláč s jemným tvarohem, povidlovým dekorem a věncem mandlí. Odrazí se k dalšímu bubákovi a přiměje ho na 4 s mlsat bez útočení a odhození s poznámkou „Ňam, ňam“. Vícero zásahů sčítá čas (odolnost dle Hladu).',

  'weapon.horky_brambor.name': 'Horký brambor z popela',
  'weapon.horky_brambor.desc': 'Brambor vytažený přímo z žhavého popela. Způsobuje popáleniny a zanechává na zemi kouřící ohnisko.',

  'weapon.vceli_roj.name': 'Včelí roj z úlu',
  'weapon.vceli_roj.desc': 'Bzučící venkovské včely ze starého špalkového úlu. Samy si nacházejí nejbližší strašidla a neúnavně je bodají.',

  'weapon.hromnicka.name': 'Hromnička',
  'weapon.hromnicka.desc': 'Posvěcená hromniční svíce z kostela. Plápolající záře mírného dosahu jemně odtlačuje nepřátele a každé 2 s způsobuje posvátné zranění (obojí ovlivněno odolností proti Strachu). Nemrtví a pekelníci mají k ní silně sníženou odolnost a utrží podstatně vyšší zranění.',

  'weapon.svecena_kropenka.name': 'Kropenka se svěcenou vodou',
  'weapon.svecena_kropenka.desc': 'Svěcená voda z kapličky svatého Jiří. Kropí široký vějíř kapek a spolehlivě zklidní noční bubáky. Nemrtví a pekelníci mají proti ní silně sníženou odolnost a utrží až dvojnásobné poškození.',

  // 12 Village buildings: name & story & role & helpers
  'building.oven.name': 'Pekárna u rozpálené pece',
  'building.oven.role': 'Pekařství a kovářská výheň',
  'building.oven.helpers': 'Ochočení rarášci s lopatami',
  'building.oven.story': 'Pekař Jan zjistil, že když raráškům nabídne misku švestkových povidel, přestanou dělat neplechu a naopak neúnavně přikládají dubová polena do pece. Buchty z této pece pečou tak žhavé, že popálí každého bubáka!',

  'building.scarecrow.name': 'Pšeničné lano a polní mez',
  'building.scarecrow.role': 'Ochrana úrody a polí',
  'building.scarecrow.helpers': 'Zpacifikovaní bubáci jako strašáci',
  'building.scarecrow.story': 'Rychtář oblékl přemožené bubáky do starých šosatých kabátů a postavil je doprostřed pšeničného pole. Žádný havran ani cizí diblík se teď neodváží přiblížit a mince se k lovci samy kutálejí!',

  'building.mill.name': 'Vodní mlýn na náhonu',
  'building.mill.role': 'Mletí mouky a pohon struhy',
  'building.mill.helpers': 'Hastrmani roztáčející mlýnské kolo',
  'building.mill.story': 'Mlynář slíbil hastrmanům, že jim nechá celý rákosový rybníček pod splavem pro jejich dušičky, pokud pomohou točit těžkým mlýnským kolem. Hastrmani nadšeně stříkají vodu a proud žene celou vesnici kupředu!',

  'building.wall.name': 'Kamenné hradby a bašta',
  'building.wall.role': 'Obrana vesnice a zdi gruntů',
  'building.wall.helpers': 'Kostliví zedníci se zednickými lžícemi',
  'building.wall.story': 'Kostliví pomocníci vyměnili své nářadí za zednické lžíce a maltu. Celou noc pilně rovnají žulové kvádry a zalévají spáry, takže zdi vesnice vydrží i nápor nejdivočejších nezbedů.',

  'building.tavernShield.name': 'Šenkýřův ochranný štít',
  'building.tavernShield.role': 'Dočasná ochrana lovce',
  'building.tavernShield.helpers': 'Šenkýři zpevňující kožené štíty',
  'building.tavernShield.story': 'Šenkýř nalije lovci na kuráž a připraví ho na první leknutí a bubácké schválnosti.',

  'building.bell.name': 'Zvonice',
  'building.bell.role': 'Urychlení speciální schopnosti',
  'building.bell.helpers': 'Zvoníci svolávající pomoc',
  'building.bell.story': 'Každý úder zvonu připomíná lovci, že další speciální schopnost je zase o něco blíž.',

  'building.forge.name': 'Kovářská výheň',
  'building.forge.role': 'Plošné posílení poškození',
  'building.forge.helpers': 'Kováři kalící každý úder',
  'building.forge.story': 'Kovář přidává do každého zásahu pevnou porci síly, takže i malé údery mají spolehlivou váhu.',

  'building.church.name': 'Kaple svaté vlny',
  'building.church.role': 'Svatá vlna při nákupu u Dědečka',
  'building.church.helpers': 'Kostelníci připravující posvěcený zvon',
  'building.church.story': 'Při každém nákupu v dědečkově nůši vyšle kaple kolem lovce posvěcenou tlakovou vlnu.',

  'building.water.name': 'Návesní studánka',
  'building.water.role': 'Pramenitá voda a posílení lektvarů',
  'building.water.helpers': 'Vodní víly střežící čistý pramen',
  'building.water.story': 'Uprostřed návsi vyvěrá křišťálový pramen, který nikdy nezamrzá. Napijí-li se z něj lovec, zahojí se mu i hluboké rány a na chvíli získá posvátný klid a odolnost vůči všemu zlu.',

  'building.forest.name': 'Hustý borový les',
  'building.forest.role': 'Zvyk na mokřady a odolnost terénu',
  'building.forest.helpers': 'Lesní mužíci vysekávající suché stezky',
  'building.forest.story': 'Starý borový les za vsí skrývá nebezpečná rašeliniště a hluboké louže. Kdo se však naučí lesním stezkám, nezapadne do bahna a promočení z něj spadne dvakrát rychleji.',

  'building.undead.name': 'Hřbitovní brána',
  'building.undead.role': 'Krocení hrobových běsů a zlevnění truhel',
  'building.undead.helpers': 'Hrobníci s posvěceným vápnem',
  'building.undead.story': 'Kovaná brána se železným křížem drží neklidné umrlce na posvěcené půdě. Když hrobníci bránu řádně zažehnají, poklady starých časů vyplují na povrch mnohem dříve.',

  'building.regen.name': 'Bylinková zahrádka',
  'building.regen.role': 'Léčivé bylinky a trvalá regenerace',
  'building.regen.helpers': 'Bába kořenářka sušící mateřídoušku',
  'building.regen.story': 'Na prosluněné mezi za chalupou voní mateřídouška, třezalka a heřmánek. Voňavé masti a horké čaje dodávají lovci klidnou mysl a vrací ztracenou Kuráž každou chvíli.',

  // 49 Bestiary enemies: name & title
  'bestiary.rarach.name': 'Rarášek',
  'bestiary.rarach.title': 'Nezbedný pekelný skřítek',

  'bestiary.plivnik.name': 'Plivník',
  'bestiary.plivnik.title': 'Hořící kuře snášející zlaťáky',

  'bestiary.sotek.name': 'Šotek',
  'bestiary.sotek.title': 'Zlomyslný skřítek zpod pece',

  'bestiary.zaba.name': 'Blatná ropucha',
  'bestiary.zaba.title': 'Slizká ropucha z mokřadu',

  'bestiary.zmrzlik.name': 'Zmrzlík',
  'bestiary.zmrzlik.title': 'Rampouchový diblík ze severáku',

  'bestiary.skodnik.name': 'Noční škodník',
  'bestiary.skodnik.title': 'Drobný hlodavec s ostrými zoubky',

  'bestiary.mysak.name': 'Polní myšák',
  'bestiary.mysak.title': 'Hladový polní hlodavec',

  'bestiary.skeleton.name': 'Kostlivec',
  'bestiary.skeleton.title': 'Chrastící kostra v rubáši',

  'bestiary.skeleton_scythe.name': 'Kostlivec s kosou',
  'bestiary.skeleton_scythe.title': 'Sekáč ze starého hřbitova',

  'bestiary.umrlec.name': 'Neklidný umrlec',
  'bestiary.umrlec.title': 'Vystupující z hlíny o půlnoci',

  'bestiary.pisar.name': 'Zbloudilý písař',
  'bestiary.pisar.title': 'Kostlivec s brkem a pergaménem',

  'bestiary.hrobnik.name': 'Hrobník',
  'bestiary.hrobnik.title': 'Umrlčí kopáč se zrezlou lopatou',

  'bestiary.bubak.name': 'Bubák',
  'bestiary.bubak.title': 'Strašidlo z temných koutů stodoly',

  'bestiary.hromotluk.name': 'Hromotluk',
  'bestiary.hromotluk.title': 'Těžkopádný noční kolos',

  'bestiary.stodolnik.name': 'Stodolník',
  'bestiary.stodolnik.title': 'Duch střežící staré seno',

  'bestiary.cerny_pes.name': 'Černý pes',
  'bestiary.cerny_pes.title': 'Přízrak s planoucíma očima',

  'bestiary.hastrman.name': 'Hastrman',
  'bestiary.hastrman.title': 'Zelený mužík v šosatém fraku',

  'bestiary.vodnicek.name': 'Vodníček',
  'bestiary.vodnicek.title': 'Nezbedný potoční diblík',

  'bestiary.topivec.name': 'Topivec',
  'bestiary.topivec.title': 'Přízrak z hlubokých tůní',

  'bestiary.blatouch.name': 'Blatouchový skřítek',
  'bestiary.blatouch.title': 'Bahnitý diblík z rákosí',

  'bestiary.meluzina.name': 'Meluzína',
  'bestiary.meluzina.title': 'Kvílivý vítr v komíně',

  'bestiary.mrazik.name': 'Mrázik',
  'bestiary.mrazik.title': 'Zimní duch kreslící na okna',

  'bestiary.severak.name': 'Severák',
  'bestiary.severak.title': 'Ledový vichr z hor',

  'bestiary.vanicka.name': 'Sněhová vánička',
  'bestiary.vanicka.title': 'Točící se chumelenice',

  'bestiary.polednice.name': 'Polednice',
  'bestiary.polednice.title': 'Bílá paní z poledního žáru',

  'bestiary.klekanice.name': 'Klekánice',
  'bestiary.klekanice.title': 'Přísný přízrak večerního soumraku',

  'bestiary.divozenka.name': 'Divoženka',
  'bestiary.divozenka.title': 'Lesní panna s věncem z kapradí',

  'bestiary.bludicka.name': 'Bludička',
  'bestiary.bludicka.title': 'Tancující bahenní světýlko',

  'bestiary.drevorubec.name': 'Zakletý dřevorubec',
  'bestiary.drevorubec.title': 'Přízračný rubač s těžkou sekerou',

  'bestiary.certik.name': 'Čertík',
  'bestiary.certik.title': 'Rozpustilý rohatý pekelník',

  'bestiary.ohnivy_muz.name': 'Ohnivý muž',
  'bestiary.ohnivy_muz.title': 'Planoucí přízrak z mezí',

  'bestiary.drab.name': 'Pekelný dráb',
  'bestiary.drab.title': 'Přísný dohlížitel s karabáčem',

  'bestiary.cert.name': 'Rohatej čert',
  'bestiary.cert.title': 'Vládce pekelné chásky',

  'bestiary.hejkal.name': 'Hejkal',
  'bestiary.hejkal.title': 'Děsivý vládce hlubokých hvozdů',

  'bestiary.obr.name': 'Zlobivý obr',
  'bestiary.obr.title': 'Hora svalů a bukového dřeva',

  'bestiary.zbojnik.name': 'Zbojník',
  'bestiary.zbojnik.title': 'Lesní loupežník s bambitkou',

  'bestiary.jiskrivec.name': 'Jiskřivec',
  'bestiary.jiskrivec.title': 'Létající ohnivá jiskra z milíře',

  'bestiary.ohnivy_pes.name': 'Ohnivý pes',
  'bestiary.ohnivy_pes.title': 'Hořící pekelný ohař',

  'bestiary.mlynar.name': 'Čertovský mlynář',
  'bestiary.mlynar.title': 'Prokletý pán vodního náhonu',

  'bestiary.bila_pani.name': 'Bílá paní',
  'bestiary.bila_pani.title': 'Vznešený hradní přízrak',

  'bestiary.zbrojnos.name': 'Rytířský zbrojnoš',
  'bestiary.zbrojnos.title': 'Obrněný strážce panských sídel',

  'bestiary.bezhlavy_rytir.name': 'Bezhlavý rytíř',
  'bestiary.bezhlavy_rytir.title': 'Strašidelný jezdec na vraníku',

  'bestiary.snehulak.name': 'Oživlý sněhulák',
  'bestiary.snehulak.title': 'Chladný Ladovský silák s hrncem',

  'bestiary.nocni_mura.name': 'Noční můra',
  'bestiary.nocni_mura.title': 'Tíživý přízrak zlých snů',

  'bestiary.drak.name': 'Tříhlavý drak',
  'bestiary.drak.title': 'Bájná saň z hlubokých slují',

  'bestiary.sazovy_rarach.name': 'Sazový rarášek',
  'bestiary.sazovy_rarach.title': 'Černý diblík z komína',

  'bestiary.krvavy_kostlivec.name': 'Krvavý kostlivec',
  'bestiary.krvavy_kostlivec.title': 'Nelítostný hrobový bojovník',

  'bestiary.ropucha.name': 'Bradavičnatá ropucha',
  'bestiary.ropucha.title': 'Jedovatá bahenní obluda',

  'bestiary.obrneny_zbojnik.name': 'Obrněný zbojník',
  'bestiary.obrneny_zbojnik.title': 'Loupežný hejtman v železné košili',
};

export const enDict: Record<string, string> = {
  // UI texts
  'ui.play': 'Play',
  'ui.test_mode': '🧪 Test Mode',
  'ui.reset_progress': '🗑️ Reset Progress',
  'ui.controls': '🎮 Controls',
  'ui.bestiary': '📖 Countryside Bestiary',
  'ui.arsenal': '🗡️ Arsenal',
  'ui.plan': '📜 Chronicles & Plan',
  'ui.village': '🏘️ Village & Tavern',
  'ui.step1': '🗺️ STEP 1 OF 2: EXPEDITION SELECT',
  'ui.step2': '🏹 STEP 2 OF 2: HUNTER SELECT',
  'ui.proceed_to_hunter': 'Proceed to Hunter Selection ➔',
  'ui.back_to_stages': '⬅ Back to Expeditions',
  'ui.start_expedition': 'Start Expedition! ➔',
  'ui.language': 'Language',
  'ui.lang_cs': '🇨🇿 Čeština',
  'ui.lang_en': '🇬🇧 English',
  'ui.close': 'Close',
  'ui.upgrade': 'Upgrade',
  'ui.unlocked': 'Unlocked',
  'ui.locked': 'Locked',
  'ui.pause': 'Pause Game',
  'ui.resume': 'Resume Game',
  'ui.restart': 'Try Again',
  'ui.victory': 'Victory!',
  'ui.defeat': 'Expedition Over',

  // 15 Weapons: name & desc
  'weapon.osikovy_prut.name': 'Aspen Rod',
  'weapon.osikovy_prut.desc': 'A flexible aspen rod cut from a grove. A swift, wide slash forcefully drives off pesky sprites and thieves. Soaked in pond water it becomes a Soaked Rod.',

  'weapon.valecnice.name': 'Rolling-Pin Matron',
  'weapon.valecnice.desc': 'A resolute village matron with a beech rolling pin (+40% size). Orbits the hunter in a wide circle (115 px), stunning foes, knocking them back, and slowing nearby enemies.',

  'weapon.cesnekova_topinka.name': 'Garlic Toast',
  'weapon.cesnekova_topinka.desc': 'Pungent aroma of fried garlic toast. Damages crowding enemies in an aura (110 px), knocking them back and slowing them by 15%.',

  'weapon.kysela_okurka.name': 'Pickled Gherkin',
  'weapon.kysela_okurka.desc': 'Hurls sour pickled gherkins. Overfed monsters turn green, weaken, and suffer increased damage.',

  'weapon.povidlove_buchty.name': 'Plum Jam Buns',
  'weapon.povidlove_buchty.desc': 'Golden baked Czech yeast buns dusted with sugar and filled with plum jam. Spooks stop to feast on delicious sweets for 1.8s instead of attacking.',

  'weapon.kovarske_vidle.name': 'Blacksmith Pitchfork',
  'weapon.kovarske_vidle.desc': 'Three-pronged forged pitchfork from the village smithy. Pierces ranks of spooks with a powerful forward thrust.',

  'weapon.kovana_halapartna.name': 'Forged Halberd',
  'weapon.kovana_halapartna.desc': 'Heavy weapon of night watchmen and bailiffs. Wide forceful cleave that fends off hordes of skeletons.',

  'weapon.dreveny_cep.name': 'Wooden Grain Flail',
  'weapon.dreveny_cep.desc': 'Iron-banded flail for threshing rye. Crushing ground impact creates a shockwave and knocks back heavy foes.',

  'weapon.devatero_kviti.name': 'Nine Herb Wreath',
  'weapon.devatero_kviti.desc': 'Fragrant protective wreath picked on St. John\'s Eve. Radiates outward, purifying the air and dispelling unclean spirits.',

  'weapon.snehova_koule.name': 'Snowball',
  'weapon.snehova_koule.desc': 'Solid snowball rolled from crisp Bohemian snow. Freezing chill slows down enemy steps.',

  'weapon.kynuty_kolac.name': 'Festive Yeast Cake',
  'weapon.kynuty_kolac.desc': 'Traditional festival cake with sweet curd and plum jam. Bounces between monsters and makes them stop to eat for 4 seconds without attacking.',

  'weapon.horky_brambor.name': 'Hot Ash Potato',
  'weapon.horky_brambor.desc': 'Potato roasted directly in glowing embers. Inflicts burns and leaves behind a smoking fire patch on the ground.',

  'weapon.vceli_roj.name': 'Bee Swarm',
  'weapon.vceli_roj.desc': 'Buzzing bees from a rustic log hive. Seek out the nearest spooks and sting them relentlessly.',

  'weapon.hromnicka.name': 'Candlemas Candle',
  'weapon.hromnicka.desc': 'Blessed Candlemas candle from the church. Flickering glow wards off enemies and periodically deals holy damage, especially against undead and demons.',

  'weapon.svecena_kropenka.name': 'Holy Water Aspergillum',
  'weapon.svecena_kropenka.desc': 'Holy water from the chapel of St. George. Sprays a wide fan of blessed droplets that calm nocturnal fiends, dealing up to double damage to undead.',

  // 12 Village buildings: name & story & role & helpers
  'building.oven.name': 'Bakery with Blazing Oven',
  'building.oven.role': 'Bakery & Smithy Hearth',
  'building.oven.helpers': 'Tamed sprites with shovels',
  'building.oven.story': 'Baker Jan discovered that offering sprites plum jam makes them stoked to feed oak logs into the oven. Fresh buns bake so piping hot they scorch every fiend!',

  'building.scarecrow.name': 'Wheat Scarecrow & Field Ridge',
  'building.scarecrow.role': 'Crop & Field Protection',
  'building.scarecrow.helpers': 'Pacified boggarts as scarecrows',
  'building.scarecrow.story': 'The bailiff dressed vanquished boggarts in tailed coats and put them in the wheat fields. Coins roll straight to the hunter!',

  'building.mill.name': 'Watermill on the Millrace',
  'building.mill.role': 'Flour Milling & Stream Power',
  'building.mill.helpers': 'Water sprites turning the wheel',
  'building.mill.story': 'The miller promised the water goblins the pond beneath the weir if they spin the wheel. Water currents propel the village forward!',

  'building.wall.name': 'Stone Walls & Bulwark',
  'building.wall.role': 'Village Fortification & Walls',
  'building.wall.helpers': 'Skeletal masons with trowels',
  'building.wall.story': 'Skeleton helpers traded tools for trowels and mortar, diligently reinforcing granite walls against unruly intruders.',

  'building.tavernShield.name': 'Innkeeper\'s Warded Shield',
  'building.tavernShield.role': 'Hunter\'s Temporary Guard',
  'building.tavernShield.helpers': 'Innkeepers reinforcing leather shields',
  'building.tavernShield.story': 'The innkeeper pours liquid courage, girding the hunter against the first frights and mischief.',

  'building.bell.name': 'Bell Tower',
  'building.bell.role': 'Ultimate Ability Haste',
  'building.bell.helpers': 'Bell ringers sounding alarm',
  'building.bell.story': 'Every strike of the bell chimes a reminder that your special ability is drawing nearer.',

  'building.forge.name': 'Blacksmith Forge',
  'building.forge.role': 'Flat Damage Enhancement',
  'building.forge.helpers': 'Smiths quenching each strike',
  'building.forge.story': 'The blacksmith tempers every blow, ensuring even small strikes carry decisive weight.',

  'building.church.name': 'Chapel of Holy Shockwave',
  'building.church.role': 'Holy Wave at Basket Purchase',
  'building.church.helpers': 'Sacristans chiming sanctified bells',
  'building.church.story': 'With every purchase from Grandfather\'s basket, the chapel unleashes a holy shockwave around the hunter.',

  'building.water.name': 'Village Spring Fountain',
  'building.water.role': 'Spring Water & Potion Potency',
  'building.water.helpers': 'Water nymphs guarding pure waters',
  'building.water.story': 'A crystal-clear village spring that never freezes. Drinking grants healing and fleeting invulnerability.',

  'building.forest.name': 'Dense Pine Forest',
  'building.forest.role': 'Wetland Acclimation & Terrain Resistance',
  'building.forest.helpers': 'Woodland sprites cleaving dry trails',
  'building.forest.story': 'The ancient pine grove conceals bogs and deep mires. Master woodland tracks to shed slowing effects faster.',

  'building.undead.name': 'Cemetery Gate',
  'building.undead.role': 'Graveyard Warding & Quicker Chests',
  'building.undead.helpers': 'Gravediggers with sanctified lime',
  'building.undead.story': 'Iron gates keep restless shades at bay. Properly sanctified, hidden relics resurface far sooner.',

  'building.regen.name': 'Herbal Garden',
  'building.regen.role': 'Healing Herbs & Courage Regen',
  'building.regen.helpers': 'Herbalist granny drying wild thyme',
  'building.regen.story': 'Wild thyme, St. John\'s wort, and chamomile bloom on sunny banks, restoring Courage over time.',

  // 49 Bestiary enemies: name & title
  'bestiary.rarach.name': 'Rake Sprite',
  'bestiary.rarach.title': 'Impish Hearth Sprite',

  'bestiary.plivnik.name': 'Gold-Spitter Chick',
  'bestiary.plivnik.title': 'Fiery Gold-Bringing Chick',

  'bestiary.sotek.name': 'Hobgoblin',
  'bestiary.sotek.title': 'Mischievous Hearth Hobgoblin',

  'bestiary.zaba.name': 'Mud Toad',
  'bestiary.zaba.title': 'Slimy Marsh Toad',

  'bestiary.zmrzlik.name': 'Frost Sprite',
  'bestiary.zmrzlik.title': 'Frosty Icicle Sprite',

  'bestiary.skodnik.name': 'Night Pest',
  'bestiary.skodnik.title': 'Small Night Pest',

  'bestiary.mysak.name': 'Field Mouse',
  'bestiary.mysak.title': 'Hungry Field Rodent',

  'bestiary.skeleton.name': 'Skeleton',
  'bestiary.skeleton.title': 'Rattling Shrouded Skeleton',

  'bestiary.skeleton_scythe.name': 'Scythe Skeleton',
  'bestiary.skeleton_scythe.title': 'Graveyard Scythe Reaper',

  'bestiary.umrlec.name': 'Restless Corpse',
  'bestiary.umrlec.title': 'Midnight Earth Riser',

  'bestiary.pisar.name': 'Lost Scribe',
  'bestiary.pisar.title': 'Skeletal Scribe with Quill & Parchment',

  'bestiary.hrobnik.name': 'Gravedigger',
  'bestiary.hrobnik.title': 'Ghastly Digger with Rusted Shovel',

  'bestiary.bubak.name': 'Barn Boggart',
  'bestiary.bubak.title': 'Spook of Dark Barn Corners',

  'bestiary.hromotluk.name': 'Thunder Hulk',
  'bestiary.hromotluk.title': 'Lumbering Night Behemoth',

  'bestiary.stodolnik.name': 'Barn Guardian',
  'bestiary.stodolnik.title': 'Spirit Guarding Ancient Hay',

  'bestiary.cerny_pes.name': 'Black Hound',
  'bestiary.cerny_pes.title': 'Apparition with Burning Eyes',

  'bestiary.hastrman.name': 'Water Goblin',
  'bestiary.hastrman.title': 'Green Man in Frock Coat',

  'bestiary.vodnicek.name': 'Little Water Sprite',
  'bestiary.vodnicek.title': 'Mischievous Brook Sprite',

  'bestiary.topivec.name': 'Drowned Shade',
  'bestiary.topivec.title': 'Haunter of Deep Pools',

  'bestiary.blatouch.name': 'Marigold Imp',
  'bestiary.blatouch.title': 'Muddy Reed Imp',

  'bestiary.meluzina.name': 'Chimney Banshee',
  'bestiary.meluzina.title': 'Howling Flue Wind',

  'bestiary.mrazik.name': 'Frosty Jack',
  'bestiary.mrazik.title': 'Winter Window Artist',

  'bestiary.severak.name': 'North Wind',
  'bestiary.severak.title': 'Icy Mountain Gale',

  'bestiary.vanicka.name': 'Blizzard Gust',
  'bestiary.vanicka.title': 'Swirling Snow Flurry',

  'bestiary.polednice.name': 'Noonwraith',
  'bestiary.polednice.title': 'White Lady of Scorching Noon',

  'bestiary.klekanice.name': 'Duskwraith',
  'bestiary.klekanice.title': 'Strict Phantom of Evening Bell',

  'bestiary.divozenka.name': 'Wild Maiden',
  'bestiary.divozenka.title': 'Woodland Maiden in Fern Wreath',

  'bestiary.bludicka.name': 'Will-o\'-the-Wisp',
  'bestiary.bludicka.title': 'Dancing Swamp Lantern',

  'bestiary.drevorubec.name': 'Cursed Lumberjack',
  'bestiary.drevorubec.title': 'Ghostly Woodcutter with Heavy Axe',

  'bestiary.certik.name': 'Little Devil',
  'bestiary.certik.title': 'Playful Horned Imp',

  'bestiary.ohnivy_muz.name': 'Fire Man',
  'bestiary.ohnivy_muz.title': 'Burning Boundary Phantom',

  'bestiary.drab.name': 'Infernal Bailiff',
  'bestiary.drab.title': 'Strict Overseer with Whip',

  'bestiary.cert.name': 'Horned Devil',
  'bestiary.cert.title': 'Lord of Infernal Rogues',

  'bestiary.hejkal.name': 'Wild Howler',
  'bestiary.hejkal.title': 'Fearsome Ruler of Deep Forests',

  'bestiary.obr.name': 'Grumpy Giant',
  'bestiary.obr.title': 'Mountain of Muscle & Beech Wood',

  'bestiary.zbojnik.name': 'Forest Highwayman',
  'bestiary.zbojnik.title': 'Woodland Brigand with Pistol',

  'bestiary.jiskrivec.name': 'Spark Imp',
  'bestiary.jiskrivec.title': 'Flying Fire Ember from Charcoal Kiln',

  'bestiary.ohnivy_pes.name': 'Fire Hound',
  'bestiary.ohnivy_pes.title': 'Burning Nether Hound',

  'bestiary.mlynar.name': 'Fiendish Miller',
  'bestiary.mlynar.title': 'Cursed Master of the Millrace',

  'bestiary.bila_pani.name': 'White Lady',
  'bestiary.bila_pani.title': 'Noble Castle Phantom',

  'bestiary.zbrojnos.name': 'Knight Squire',
  'bestiary.zbrojnos.title': 'Armored Manorial Guard',

  'bestiary.bezhlavy_rytir.name': 'Headless Knight',
  'bestiary.bezhlavy_rytir.title': 'Haunted Rider on Black Steed',

  'bestiary.snehulak.name': 'Living Snowman',
  'bestiary.snehulak.title': 'Frosty Pot-Headed Brawler',

  'bestiary.nocni_mura.name': 'Nightmare Mare',
  'bestiary.nocni_mura.title': 'Oppressive Shade of Bad Dreams',

  'bestiary.drak.name': 'Three-Headed Dragon',
  'bestiary.drak.title': 'Mythic Wyrm of Caverns Deep',

  'bestiary.sazovy_rarach.name': 'Sooty Sprite',
  'bestiary.sazovy_rarach.title': 'Black Chimney Imp',

  'bestiary.krvavy_kostlivec.name': 'Crimson Skeleton',
  'bestiary.krvavy_kostlivec.title': 'Relentless Tomb Warrior',

  'bestiary.ropucha.name': 'Warty Toad',
  'bestiary.ropucha.title': 'Venomous Bog Monster',

  'bestiary.obrneny_zbojnik.name': 'Armored Brigand',
  'bestiary.obrneny_zbojnik.title': 'Bandit Captain in Iron Mail',
};

export const dictionaries: Record<SupportedLang, Record<string, string>> = {
  cs: csDict,
  en: enDict,
};

export function t(key: string, lang: SupportedLang | string = 'cs', params?: Record<string, string | number>): string {
  const safeLang: SupportedLang = lang === 'en' ? 'en' : 'cs';
  const dict = dictionaries[safeLang] || dictionaries.cs;
  let text = dict[key];

  if (!text && safeLang !== 'cs') {
    text = dictionaries.cs[key];
  }

  if (!text) {
    return key;
  }

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return text;
}

export function getWeaponTranslation(id: string, lang: SupportedLang | string = 'cs'): { name: string; desc: string } {
  return {
    name: t(`weapon.${id}.name`, lang),
    desc: t(`weapon.${id}.desc`, lang),
  };
}

export function getBuildingTranslation(id: string, lang: SupportedLang | string = 'cs'): { name: string; story: string; role: string; helpers: string } {
  return {
    name: t(`building.${id}.name`, lang),
    story: t(`building.${id}.story`, lang),
    role: t(`building.${id}.role`, lang),
    helpers: t(`building.${id}.helpers`, lang),
  };
}

export function getBestiaryTranslation(id: string, lang: SupportedLang | string = 'cs'): { name: string; title: string } {
  return {
    name: t(`bestiary.${id}.name`, lang),
    title: t(`bestiary.${id}.title`, lang),
  };
}
