import { ChroniclerSession } from '../types/session';

export const SAMPLE_SESSION_24: ChroniclerSession = {
  id: 'session-sample-24',
  sessionNumber: 24,
  sessionTitle: 'Session 24: Depths of the Sunless Citadel',
  date: '2026-08-14',
  durationSeconds: 13320, // 3 hours 42 minutes = 13320s
  formattedDuration: '3h 42m',
  status: 'ready',
  partyMembers: ['Thorin Ironforge', 'Lyra Nightbreeze', 'Krag Stoutheart', 'Zephyr Stormborn'],
  createdAt: Date.now() - 86400000 * 2,
  data: {
    sessionTitle: 'Session 24: Depths of the Sunless Citadel',
    sessionNumber: 24,
    sessionDuration: '3h 42m',
    overallSummary: {
      highLevelNarrative:
        'The party ventured deeper into the subterranean ruins beneath the Sunless Citadel, seeking the corrupted Twilight Grove and the source of the blighted Gulthias Apple. Traversing the submerged goblin barricades, the adventurers breached the lower sanctum where the exiled druid Belak the Outcast had fused his soul with the ancient vampiric tree roots.\n\nFollowing a tense tactical engagement against needle blights and thralls, Thorin Ironforge unleashed radiant dawnfire to sever the blood conduit sustaining the Gulthias tree. The corrupted dryad yielded the obsidian seal of Karak-Varn before dissolving into ash, opening the forgotten gateway to the deeper dwarven vaults beneath the rift.',
      timeline: [
        {
          timestamp: '00:12:45',
          seconds: 765,
          event: 'The party dismantles the goblin watchpost at the Sunken Chasm using magical silence.'
        },
        {
          timestamp: '00:48:10',
          seconds: 2890,
          event: 'Encounter with Meepo the Kobold Keeper; negotiated passage in exchange for a dragon statuette.'
        },
        {
          timestamp: '01:24:30',
          seconds: 5070,
          event: 'Discovered the ancient dwarven relief depicting the sealing of the Shadow Dragon Umbrax.'
        },
        {
          timestamp: '02:05:15',
          seconds: 7515,
          event: 'Belak the Outcast emerges from the Twilight Grove, demanding the party surrender their relics.'
        },
        {
          timestamp: '02:35:00',
          seconds: 9300,
          event: 'Combat erupted; Thorin cast Spirit Guardians while Krag shattered the Gulthias roots with his maul.'
        },
        {
          timestamp: '03:18:40',
          seconds: 11920,
          event: 'Defeat of the Gulthias Thralls and retrieval of the Obsidian Seal of Karak-Varn.'
        },
        {
          timestamp: '03:38:10',
          seconds: 13090,
          event: 'The party establishes a fortified campsite within the grove to rest and attune to new spoils.'
        }
      ],
      npcInteractions: [
        {
          name: 'Meepo the Kobold Keeper',
          description: 'A ragged, weeping kobold scale-sorcerer mourning the loss of the clan wyrmling Calcryx.',
          loreRevealed: 'Revealed that the goblins sold the white wyrmling to hobgoblin mercenaries deeper in the lower rift.'
        },
        {
          name: 'Belak the Outcast',
          description: 'A fallen druid infected with wooden bark skin, wielding twisted oak staves and commanding plant thralls.',
          loreRevealed: 'Claimed the Gulthias tree was seeded from the stake used to slay an ancient vampire lord beneath the mountains centuries ago.'
        },
        {
          name: 'Sharwyn the Enchantress (Thrall)',
          description: 'A captured adventurer whose eyes were clouded by thorny root growths, bound to Belak by plant sap.',
          loreRevealed: 'Whispered the command words to bypass the arcane locking ward on the Karak-Varn gate before collapsing.'
        }
      ],
      combatEncounters: [
        {
          encounter: 'Goblin Barricade & Briar Snipers',
          enemies: '6 Goblin Skirmishers, 2 Twig Blight Snipers, 1 Drow Mercenary',
          outcome: 'Decisive victory without spending high-level spell slots. Captured 1 drow map.',
          casualties: 'Zephyr took 14 piercing damage; Krag sustained minor poison exposure.'
        },
        {
          encounter: 'Clash at the Twilight Grove (Boss Battle)',
          enemies: 'Belak the Outcast, 8 Needle Blights, 2 Gulthias Thralls, 1 Giant Briar Serpent',
          outcome: 'Victory achieved after severing the heartwood conduit. Belak perished in divine flame.',
          casualties: 'Lyra reduced to 4 HP; Thorin expended 2 Level-3 spell slots and 1 Channel Divinity.'
        }
      ],
      lootAndRewards: {
        goldAcquired: '480 GP, 1,200 SP, 3 uncut amethyst gems worth 150 GP total',
        magicItems: [
          {
            name: 'Wand of Entangle',
            recipient: 'Lyra Nightbreeze',
            properties: 'Requires attunement. 7 charges to cast Entangle (DC 15). Regains 1d6+1 charges at dawn.'
          },
          {
            name: 'Sunfire Amulet of Karak-Varn',
            recipient: 'Thorin Ironforge',
            properties: 'Grants +1 to spell attack rolls and allows the wearer to cast Daylight once per long rest without expending a spell slot.'
          },
          {
            name: 'Potion of Invulnerability',
            recipient: 'Krag Stoutheart',
            properties: 'Grants resistance to all damage for 1 minute when consumed.'
          }
        ],
        mundaneLoot: [
          'Masterwork Dwarven Masonry Chisel',
          '3 Flasks of Alchemist Fire',
          'Intricate Brass Astrolabe Fragment',
          '50 ft. Silk Rope with Adamantine Grappling Hook'
        ]
      },
      unresolvedHooks: [
        'Unlock the great adamantine gateway to Karak-Varn using the newly acquired Obsidian Seal.',
        'Track down the hobgoblin mercenary band that absconded with the captured white wyrmling Calcryx.',
        'Purify the remaining blighted roots to prevent dark sap from seeping into the underground aqueduct.'
      ]
    },
    characterBreakdowns: {
      'Thorin Ironforge': {
        roleSummary:
          'Thorin served as the radiant vanguard and spiritual anchor throughout the descent. His divine wards shielded the party from thorny fungal spores, and his decisive casting of Spirit Guardians decimated the flanking swarm of needle blights.',
        keyMoments: [
          'Rolled a critical success (Natural 20) on Religion to decipher the dwarven glyphs warning of the Gulthias tree curse.',
          'Used Guided Strike Channel Divinity to ensure his Sun Mace shattered the heartwood altar.',
          'Administered Healing Word to rescue Lyra from unconsciousness right before the serpent struck.'
        ],
        combatPerformance:
          'Cast Spirit Guardians (Level 3), Spiritual Weapon (Level 2), and two Healing Words. Dealt approximately 64 radiant damage to the blights and absorbed 22 bludgeoning damage behind his Shield of the Sentinel.',
        socialAndRoleplay:
          'Took the lead in interrogating the dying thrall Sharwyn, offering divine solace and recording her final words for the records of the Iron Vanguard.'
      },
      'Lyra Nightbreeze': {
        roleSummary:
          'Lyra provided critical battlefield reconnaissance, disarming three mechanical tripwires and neutralizing the goblin lookout with silent sleep arrows.',
        keyMoments: [
          'Successfully picked the enchanted dwarven lock on the sealed reliquary.',
          'Evaded a lethal spike trap by executing an acrobatics roll over the pit.'
        ],
        combatPerformance:
          'Dealt sneak attack damage in three consecutive rounds with her enchanted shortbow, picking off the needle blights from long range.',
        socialAndRoleplay:
          'Negotiated with Meepo the Kobold Keeper, offering a shiny brass trinket to secure safe passage through the kobold Warrens.'
      },
      'Krag Stoutheart': {
        roleSummary:
          'Krag anchored the front line, soaking massive physical punishment from the Giant Briar Serpent while creating breathing room for the spellcasters.',
        keyMoments: [
          'Shoved the Briar Serpent into the spiked roots to expose its vulnerable soft underbelly.',
          'Endured three successive poisonous bites without succumbing to paralysis.'
        ],
        combatPerformance:
          'Raged for the entire duration of the boss encounter, landing Reckless Greatsword strikes dealing over 85 total slashing damage.',
        socialAndRoleplay:
          'Examined the broken dwarven armaments in the grove, swearing an oath of vengeance on behalf of the fallen clans.'
      },
      'Zephyr Stormborn': {
        roleSummary:
          'Zephyr manipulated wind currents to disperse poisonous spore clouds and laid down crowd control spells that prevented the party from being encircled.',
        keyMoments: [
          'Cast Gust of Wind to blow the flammable alchemist fire fumes directly back into the goblin barricade.',
          'Countered Belak\'s attempt to summon a second wave of blights using Shatter.'
        ],
        combatPerformance:
          'Cast Shatter (Level 2) and Lightning Bolt (Level 3), destroying the wooden barricades and softening up the frontline thralls.',
        socialAndRoleplay:
          'Identified the astrological alignment etched into the ceiling, predicting the exact solstice window required for the gate ritual.'
      }
    },
    fullTranscript: [
      {
        timestamp: '00:01:10',
        seconds: 70,
        speaker: 'Dungeon Master',
        text: 'The heavy stone door grinds shut behind you, sealing out the damp twilight above. The air here smells of damp loam, crushed pine needles, and something sickly sweet—like rotting sap.'
      },
      {
        timestamp: '00:01:45',
        seconds: 105,
        speaker: 'Thorin Ironforge',
        text: 'I raise my mace aloft, channeling the light of the Silver Dawn. Let the light pierce this darkness. Keep your eyes sharp; evil takes root quickly in sunless earth.'
      },
      {
        timestamp: '00:02:20',
        seconds: 140,
        speaker: 'Lyra Nightbreeze',
        text: 'Hold up, Thorin. Down the corridor to the left—there are fresh drag marks in the dust. Small footprints. Three-toed. Kobolds or goblins.'
      },
      {
        timestamp: '00:03:05',
        seconds: 185,
        speaker: 'Krag Stoutheart',
        text: 'Let them come. My axe has been quiet for too long. If they bar the path to Karak-Varn, we cleave them in two.'
      },
      {
        timestamp: '00:12:45',
        seconds: 765,
        speaker: 'Dungeon Master',
        text: 'Ahead of you sits a makeshift barricade of sharpened logs and thorny brambles. Two goblins are crouching behind it with shortbows drawn, whispering in their harsh tongue.'
      },
      {
        timestamp: '00:13:15',
        seconds: 795,
        speaker: 'Zephyr Stormborn',
        text: 'I gesture with my staff and whisper the arcane incantation. Silence settles over their position in a 20-foot sphere. Move in now while they cannot sound the horn!'
      },
      {
        timestamp: '00:48:10',
        seconds: 2890,
        speaker: 'Meepo the Kobold Keeper',
        text: 'No hurt Meepo! Meepo is keeper of dragons! Bad goblins stole great Calcryx! Help Meepo find wyrmling and Meepo shows secret passage to lower grove!'
      },
      {
        timestamp: '00:49:00',
        seconds: 2940,
        speaker: 'Lyra Nightbreeze',
        text: 'I kneel down and present the small polished brass dragon figurine we found earlier. Tell us where the grove door lies, little one, and this token of your kin is yours.'
      },
      {
        timestamp: '01:24:30',
        seconds: 5070,
        speaker: 'Thorin Ironforge',
        text: 'Look here upon the stone relief. The runes are old Khuzdul—the script of my ancestors. It depicts the ancient seal holding Umbrax in the deep dark. Belak is trying to disturb things far older than him.'
      },
      {
        timestamp: '02:05:15',
        seconds: 7515,
        speaker: 'Belak the Outcast',
        text: 'You trespass upon sacred rebirth, intruders! The sun above is weak and fading, but the blood-tree below grows eternal! Surrender your weapons and become rich soil for the next bloom!'
      },
      {
        timestamp: '02:06:00',
        seconds: 7560,
        speaker: 'Thorin Ironforge',
        text: 'Your tree is an abomination, Belak! In the name of the Silver Dawn, I cleanse this grove of your rot! Radiant spirits of the fallen, surround us!'
      },
      {
        timestamp: '02:35:00',
        seconds: 9300,
        speaker: 'Dungeon Master',
        text: 'Swirling luminous spirits take the form of dwarven shield-maidens, circling Thorin in a 15-foot radius of blinding gold light. The needle blights screech as their bark begins to char!'
      },
      {
        timestamp: '02:36:10',
        seconds: 9370,
        speaker: 'Krag Stoutheart',
        text: 'I charge straight at the main trunk! With both hands on the greatsword, I strike with everything I have! Natural 19 to hit!'
      },
      {
        timestamp: '03:18:40',
        seconds: 11920,
        speaker: 'Dungeon Master',
        text: 'With a thunderous crack, the heartwood fractures. Divine light pours out from the fissures as Belak falls to his knees, his wooden skin crumbling into dry ash. Among the glowing embers lies an ornate obsidian disc carved with ancient dwarven geometry.'
      },
      {
        timestamp: '03:20:10',
        seconds: 12010,
        speaker: 'Thorin Ironforge',
        text: 'The Obsidian Seal of Karak-Varn. After three hundred years of darkness, the gates to the ancestral halls will finally open once more.'
      }
    ]
  }
};
