# `fantasy_text_rpg_engine_design_document.md`

## Game Engine Design Document  
### Self-Contained HTML Medieval Fantasy Text RPG / Text Adventure Engine

**Document purpose:**  
This document captures the agreed design intent, mechanics, architecture, and implementation approach for a single-file HTML medieval fantasy text RPG engine. It is intended to be saved and reused as a reference in future development sessions if conversational context is lost.

**Project type:**  
Old-school medieval fantasy text adventure with RPG mechanics, command parser, modular JSON data, hidden dice rolls, turn-based time, NPC/monster schedules, inventory, encumbrance, and save import/export.

**Target format:**  
One self-contained `.html` file.

---

# 1. Project Overview

The project is a **single-player browser-based medieval fantasy text RPG engine** delivered as a **self-contained HTML file**.

The intended experience is similar to an old-school text adventure or interactive fiction game, but with deeper RPG systems running invisibly in the background.

The player interacts by typing commands such as:

```text
look
go north
talk to innkeeper
take sword
equip sword
inventory
wait
attack goblin
read runes
persuade guard
```

Behind the scenes, the engine supports:

- character creation
- stats and skills
- hidden dice rolls
- inventory and equipment
- item weight and encumbrance
- status effects
- flags and variables
- conditional text
- turn-based time
- atmospheric calendar display
- NPC and monster schedules
- local persistence
- save export/import

The intended result is not merely a fixed text adventure, but a **small reusable text RPG engine** that can support modular game content.

---

# 2. Core Design Goals

## 2.1 Primary Goals

The engine should:

1. Run entirely inside a single `.html` file.
2. Require no server for normal play.
3. Store world data as modular JSON collections.
4. Use stable IDs for all game entities.
5. Provide an intermediate command parser.
6. Support RPG-style hidden checks.
7. Include a character builder.
8. Include inventory, equipment, weight, and encumbrance.
9. Support turn-based time.
10. Support NPC and monster schedules.
11. Support flags, variables, and conditional text.
12. Save and load using browser storage.
13. Provide essential save export/import.
14. Be expandable without rewriting the engine.

## 2.2 Design Philosophy

The player should experience the game as prose and choice, not as raw mechanics.

For example, the player types:

```text
force gate
```

The engine may internally perform:

$$
d20 + might + athletics + modifiers \geq difficulty
$$

But the visible result should be narrative:

```text
You brace your shoulder against the iron gate and shove. The hinges shriek, but the gate holds.
```

Mechanical transparency may optionally be provided through a debug or verbose mode, but the default experience should feel like interactive fiction.

---

# 3. Technical Target

## 3.1 Runtime Environment

The engine will use:

- HTML for document structure
- CSS for presentation
- JavaScript for all game logic
- JSON-style JavaScript objects for data tables
- `localStorage` for local persistence
- optional text-based export/import for save portability

## 3.2 Distribution Format

The game should be distributable as:

```text
fantasy-adventure.html
```

The player can open the file in a browser.

No build process is required for the minimum version.

## 3.3 Browser Storage Caveat

The engine will use `localStorage`, but exported saves are essential because browser storage can be lost if:

- the player clears site data
- the browser purges local storage
- the game is opened from a different browser
- the file path or origin changes
- the player uses private/incognito mode

Therefore, **save export/import is a required feature**, not optional.

---

# 4. High-Level Architecture

The engine should be structured into logical systems even though it lives in one HTML file.

Recommended top-level structure:

```javascript
const Game = {
  version: "1.0.0",

  data: {},
  state: {},

  ui: {},
  parser: {},
  engine: {},
  checks: {},
  inventory: {},
  characterCreation: {},
  clock: {},
  schedules: {},
  storage: {},
  conditions: {},
  combat: {},
  dialogue: {},
  utilities: {}
};
```

## 4.1 Major Engine Systems

| System | Responsibility |
|---|---|
| UI system | Terminal-style output, input handling, panels/screens |
| Parser | Convert typed commands into structured actions |
| Game engine | Execute commands and update state |
| Data system | Hold static JSON collections |
| State manager | Track dynamic game state |
| Character builder | Create player character |
| RPG checks | Hidden dice rolls and skill checks |
| Inventory system | Items, equipment, carried weight |
| Encumbrance system | Carry capacity and penalties |
| Clock system | Turn-based time and calendar display |
| Schedule system | NPC/monster locations by time |
| Condition system | Status effects and timed effects |
| Combat system | Attacks, damage, morale, defeat |
| Dialogue system | NPC interaction and conditional text |
| Storage system | Save/load/localStorage/export/import |

---

# 5. Static Data vs Dynamic State

A key design decision is to keep **static game data** separate from **dynamic save state**.

## 5.1 Static Data

Static data defines the world.

Examples:

```text
Locations
Items
NPC templates
Monster templates
Backgrounds
Skills
Conditions
Schedules
Dialogues
Quests
Spells
```

Static data should usually be embedded in the HTML file as JavaScript constants.

Example:

```javascript
const DATA = {
  locations: [],
  items: [],
  npcs: [],
  monsters: [],
  backgrounds: [],
  schedules: [],
  dialogues: [],
  conditions: [],
  spells: []
};
```

## 5.2 Dynamic State

Dynamic state changes during play.

Examples:

```text
Player location
Player stats
Player inventory
Equipped items
Flags
Variables
Clock
Moved items
Defeated monsters
NPC attitude changes
Open/closed doors
Quest progress
Conditions
```

Example:

```javascript
const STATE = {
  mode: "playing",

  player: {},
  clock: {},
  flags: {},
  variables: {},

  world: {
    itemLocations: {},
    npcOverrides: {},
    monsterStates: {},
    locationStates: {}
  }
};
```

## 5.3 Intent Behind This Decision

Separating static data from dynamic state:

- keeps save files smaller
- improves save compatibility
- allows content updates
- avoids duplicating the whole world into every save
- makes debugging easier
- supports future expansion

---

# 6. IDs and Naming Conventions

All entities should use stable lowercase IDs.

Examples:

```text
village_square
borin_shopkeeper
rusty_sword
goblin_scout
village_hunter
old_barrow
silver_stag_tavern
```

## 6.1 Required ID Fields

| Entity | ID Field |
|---|---|
| Location | `id` |
| Item | `id` |
| NPC | `id` |
| Monster | `id` |
| Schedule | `id` |
| Background | `id` |
| Skill | `id` |
| Condition | `id` |
| Dialogue | `id` |
| Quest | `id` |
| Spell | `id` |

## 6.2 Intent Behind This Decision

IDs are required because display names can change.

For example, the item named:

```text
Rusty Sword
```

should still be saved as:

```text
rusty_sword
```

This prevents save corruption if item names are edited later.

---

# 7. Game Modes

The engine should support different modes.

Recommended modes:

```javascript
const GameModes = {
  TITLE: "title",
  CHARACTER_CREATION: "character_creation",
  PLAYING: "playing",
  GAME_OVER: "game_over"
};
```

Input should be routed depending on mode.

```javascript
function handleInput(input) {
  if (state.mode === "character_creation") {
    return Game.characterCreation.handleInput(input);
  }

  if (state.mode === "playing") {
    return Game.engine.handleCommand(input);
  }

  if (state.mode === "title") {
    return Game.ui.handleTitleInput(input);
  }
}
```

## 7.1 Intent Behind This Decision

The command system must behave differently during character creation than during normal play.

For example:

```text
increase might
choose village hunter
continue
```

are valid during character creation, while:

```text
go north
attack goblin
take torch
```

are valid during play.

---

# 8. Command Parser

## 8.1 Parser Complexity Level

The engine will use an **intermediate parser**.

This means it should support:

- verbs
- aliases
- direct objects
- prepositions
- indirect objects
- multi-word item/NPC names
- common text adventure commands
- basic command normalization

It does not need to implement full natural language understanding.

## 8.2 Example Commands

```text
look
look at sign
examine old sword
go north
north
take sword
drop torch
drop 2 torches
equip sword
wear chainmail
remove cloak
use key on door
give coin to beggar
talk to innkeeper
ask borin about goblins
attack goblin
wait
wait 1 hour
sleep
inventory
show inv
status
```

## 8.3 Canonical Command Structure

The parser should convert input into a structure like:

```javascript
{
  raw: "use iron key on old door",
  verb: "use",
  directObjectText: "iron key",
  preposition: "on",
  indirectObjectText: "old door",
  quantity: null
}
```

Another example:

```javascript
{
  raw: "drop 2 torches",
  verb: "drop",
  directObjectText: "torches",
  quantity: 2,
  preposition: null,
  indirectObjectText: null
}
```

## 8.4 Verb Aliases

Aliases should map player phrasing to canonical verbs.

Example:

```javascript
const verbAliases = {
  i: "inventory",
  inv: "inventory",
  inventory: "inventory",
  equipment: "inventory",
  status: "inventory",
  gear: "inventory",

  n: "go",
  north: "go",
  s: "go",
  south: "go",
  e: "go",
  east: "go",
  w: "go",
  west: "go",
  u: "go",
  up: "go",
  d: "go",
  down: "go",

  get: "take",
  grab: "take",
  pickup: "take",
  "pick up": "take",

  examine: "look",
  inspect: "look",
  x: "look",

  wield: "equip",
  wear: "equip",
  "put on": "equip",

  remove: "unequip",
  "take off": "unequip",

  strike: "attack",
  hit: "attack",
  fight: "attack"
};
```

## 8.5 Multi-Word Aliases

The parser should detect multi-word aliases before splitting the command too aggressively.

Examples:

```text
pick up sword
put on cloak
take off armor
look at sign
show inv
```

## 8.6 Intent Behind This Decision

An intermediate parser gives enough flexibility to feel like a classic text adventure while avoiding the cost and ambiguity of a full natural-language parser.

---

# 9. Core RPG Mechanics

## 9.1 Dice Philosophy

The game should use hidden dice rolls.

The player should usually see prose, not raw roll data.

Optional debug output can reveal the mechanics if desired.

## 9.2 Core Roll Formula

The central mechanic is:

$$
d20 + stat + skill + modifiers \geq difficulty
$$

Where:

- `d20` is a random number from 1 to 20
- `stat` is one of the six core attributes
- `skill` is the relevant trained ability
- `modifiers` include equipment, conditions, encumbrance, light, reputation, etc.
- `difficulty` is the target number

Example:

```javascript
rollCheck(player, "agility", "thievery", 14);
```

## 9.3 Difficulty Scale

| Difficulty | Target Number | Example |
|---|---:|---|
| Trivial | 5 | Climb a ladder |
| Easy | 8 | Force a weak door |
| Moderate | 12 | Pick a common lock |
| Hard | 16 | Sneak past an alert guard |
| Very Hard | 20 | Read ancient runes |
| Heroic | 24 | Resist dragon fear |
| Legendary | 28 | Break an ancient curse |

## 9.4 Degrees of Success

Checks should support more than pass/fail.

Let:

$$
margin = total - difficulty
$$

Recommended outcomes:

| Result | Meaning |
|---|---|
| Natural 20 | Critical success |
| Margin at least $5$ | Strong success |
| Margin at least $0$ | Success |
| Margin below $0$ | Failure |
| Margin $-5$ or worse | Bad failure |
| Natural 1 | Critical failure |

Example outcome function:

```javascript
function getOutcome(result) {
  const margin = result.total - result.difficulty;

  if (result.roll === 20) return "critical_success";
  if (result.roll === 1) return "critical_failure";
  if (margin >= 5) return "strong_success";
  if (margin >= 0) return "success";
  if (margin <= -5) return "bad_failure";
  return "failure";
}
```

## 9.5 Intent Behind This Decision

Degrees of success are valuable because text adventures can show different prose for different outcomes.

Example lockpicking:

```text
Critical success:
The lock opens almost instantly, and you leave no sign of tampering.

Success:
The lock clicks open.

Failure:
The lock resists your tools.

Bad failure:
Your pick snaps inside the mechanism.

Critical failure:
The lock jams with a harsh metallic crack.
```

---

# 10. Core Character Stats

The engine will use six core stats.

| Stat | Purpose |
|---|---|
| `might` | Strength, melee power, forcing doors, carrying weight |
| `agility` | Reflexes, stealth, ranged attacks, dodging |
| `endurance` | Health, stamina, poison resistance, fatigue |
| `intellect` | Lore, investigation, puzzles, arcane knowledge |
| `will` | Courage, discipline, magic, fear resistance |
| `presence` | Persuasion, intimidation, deception, leadership |

## 10.1 Intent Behind This Decision

This stat set covers standard fantasy actions while staying compact.

It also avoids using copyrighted tabletop terminology while remaining familiar.

---

# 11. Skills

Recommended skill list:

| Skill | Main Stat | Purpose |
|---|---|---|
| `athletics` | `might` | Climbing, jumping, forcing, grappling |
| `stealth` | `agility` | Sneaking, hiding, ambushes |
| `thievery` | `agility` | Lockpicking, traps, sleight of hand |
| `survival` | `endurance` | Tracking, foraging, wilderness travel |
| `lore` | `intellect` | History, magic, religion, monsters |
| `investigation` | `intellect` | Searching, clues, hidden details |
| `persuasion` | `presence` | Friendly social influence |
| `deception` | `presence` | Lying, disguise, misdirection |
| `intimidation` | `presence` or `might` | Threats and coercion |
| `melee` | `might` | Swords, axes, clubs, brawling |
| `ranged` | `agility` | Bows, thrown weapons |
| `defense` | `agility` or `endurance` | Avoiding or absorbing harm |
| `magic` | `will` or `intellect` | Spellcasting and rituals |

## 11.1 Intent Behind This Decision

Skills provide character differentiation without making the stat system too granular.

---

# 12. Character Builder

## 12.1 Required Character Creation Flow

A new game should start with a character builder.

Recommended steps:

```text
1. Enter name
2. Choose background
3. Allocate stat points
4. Choose trained skills
5. Review starting equipment
6. Confirm character
7. Begin opening scene
```

## 12.2 Stat Allocation

Starting model:

```text
All stats begin at 0.
Player receives 6 stat points.
No stat may start above 3.
Optional: one stat may be lowered to -1 to gain one extra point.
```

Example:

```text
Might:      2
Agility:    1
Endurance:  1
Intellect:  0
Will:       1
Presence:   1
```

Total spent: $6$

## 12.3 Skill Selection

Recommended model:

```text
All skills begin at 0.
Background grants skill bonuses.
Player chooses 4 trained skills.
Each trained skill gains +1.
No skill may start above 3.
```

## 12.4 Backgrounds

Backgrounds provide roleplaying identity and mechanical bonuses.

Examples:

| Background | Theme |
|---|---|
| `mercenary` | Combat-focused |
| `village_hunter` | Wilderness and ranged combat |
| `hedge_wizard` | Low magic |
| `temple_acolyte` | Faith, lore, willpower |
| `street_urchin` | Stealth and deception |
| `disgraced_noble` | Social influence |
| `grave_robber` | Exploration and locks |

Backgrounds can grant:

- stat bonuses
- skill bonuses
- starting items
- starting gold
- starting flags
- faction reputation
- special dialogue options

## 12.5 Character Draft

Character creation should use a temporary draft object.

```javascript
const characterDraft = {
  name: "",
  backgroundId: null,

  baseStats: {
    might: 0,
    agility: 0,
    endurance: 0,
    intellect: 0,
    will: 0,
    presence: 0
  },

  allocatedStatPoints: 0,
  maxStatPoints: 6,

  chosenSkills: [],

  finalStats: {},
  finalSkills: {},

  startingItems: [],
  startingGold: 0
};
```

## 12.6 Starting Resources

Recommended formulas:

### HP

$$
maxHp = 10 + 2 \times endurance
$$

### Stamina

$$
maxStamina = 8 + endurance + might
$$

### Mana

If the character has a magical background or magic training:

$$
maxMana = 4 + will + intellect
$$

Non-magical characters may start with `mana` equal to `0`.

## 12.7 Intent Behind This Decision

A character builder makes the game more roleplay-driven and increases replayability.

The builder should be simple enough to complete quickly but meaningful enough to support different builds.

---

# 13. Player Character Schema

Recommended player structure:

```javascript
const player = {
  id: "player",
  name: "Rowan",
  background: "village_hunter",

  level: 1,
  xp: 0,

  stats: {
    might: 1,
    agility: 2,
    endurance: 1,
    intellect: 0,
    will: 1,
    presence: 0
  },

  skills: {
    athletics: 0,
    stealth: 1,
    thievery: 0,
    survival: 2,
    lore: 0,
    investigation: 1,
    persuasion: 0,
    deception: 0,
    intimidation: 0,
    melee: 0,
    ranged: 1,
    defense: 1,
    magic: 0
  },

  resources: {
    hp: 14,
    maxHp: 14,
    stamina: 10,
    maxStamina: 10,
    mana: 0,
    maxMana: 0
  },

  inventory: [
    { itemId: "skinning_knife", quantity: 1 },
    { itemId: "travel_rations", quantity: 3 },
    { itemId: "flint_and_steel", quantity: 1 }
  ],

  equipment: {
    weapon: "hunting_bow",
    offhand: null,
    armor: "travel_cloak",
    cloak: null,
    accessory1: null,
    accessory2: null
  },

  gold: 8,

  conditions: [],

  reputation: {
    village: 1,
    church: 0,
    thieves_guild: 0,
    goblins: -1
  },

  flags: {}
};
```

---

# 14. Inventory System

## 14.1 Inventory Commands

The parser should support:

```text
inventory
inv
i
show inventory
show inv
equipment
status
gear
```

These should all route to the inventory/status screen.

## 14.2 Inventory Screen Contents

The inventory screen should show:

```text
Name
Background
Level and XP
Current time
HP / Stamina / Mana
Weapon
Armor
Shield/offhand
Accessories
Status effects
Gold
Carried weight
Carry capacity
Encumbrance state
Carried items
```

Example:

```text
==================================================
INVENTORY
==================================================

Name: Rowan
Background: Village Hunter
Level: 1
Time: Late afternoon, third day of Frostwane

Health:   14 / 14
Stamina:  10 / 10
Mana:      0 / 0

Weapon:   Hunting Bow
Offhand:  None
Armor:    Travel Cloak
Cloak:    None

Status Effects:
None

Gold: 8

Carried Weight: 42 / 70 lb
Encumbrance: Unencumbered

Carried Items:
- Skinning Knife          1 lb
- Travel Rations x3       3 lb
- Flint and Steel         1 lb
- Old Iron Key            0 lb
- Coil of Rope           10 lb
==================================================
```

## 14.3 Inventory Does Not Advance Time

The following commands should not advance time:

```text
inventory
status
equipment
gear
look
help
```

The following should advance time:

```text
take item
drop item
equip item
unequip item
drink potion
eat ration
light torch
wear armor
remove armor
```

Suggested time costs:

| Action | Time Cost |
|---|---:|
| Check inventory | 0 minutes |
| Pick up item | 1 minute |
| Drop item | 1 minute |
| Equip weapon | 1 minute |
| Equip shield/offhand | 1 minute |
| Wear armor | 5 minutes |
| Remove armor | 3 minutes |
| Drink potion | 1 minute |
| Eat ration | 10 minutes |
| Light torch | 1 minute |

## 14.4 Inventory Data Model

Inventory should store stackable item entries.

```javascript
inventory: [
  { itemId: "travel_rations", quantity: 3 },
  { itemId: "torch", quantity: 2 },
  { itemId: "old_iron_key", quantity: 1 }
]
```

Equipped items should be stored separately in `equipment`.

## 14.5 Intent Behind This Decision

Keeping equipment separate from inventory avoids double-counting and makes display easier.

Equipped items still count toward carried weight.

---

# 15. Item System

## 15.1 Item Schema

Recommended item structure:

```javascript
const item = {
  id: "iron_sword",
  name: "iron sword",
  type: "weapon",
  aliases: ["sword", "blade"],
  description: "A plain but reliable iron sword.",
  weight: 3,

  stackable: false,
  portable: true,

  slot: "weapon",

  stat: "might",
  skill: "melee",
  damage: "1d8",
  attackBonus: 0,

  value: 20
};
```

## 15.2 Item Types

Recommended item types:

```text
weapon
armor
shield
clothing
tool
consumable
key
quest
treasure
container
light
book
misc
```

## 15.3 Weight

Every item should have a `weight`.

Small quest items may have weight `0`.

Example:

```javascript
{
  id: "old_iron_key",
  name: "old iron key",
  type: "key",
  weight: 0,
  portable: true
}
```

## 15.4 Stackable Items

Consumables and ammunition should be stackable.

Examples:

```text
arrows
rations
torches
coins
herbs
lockpicks
```

---

# 16. Equipment System

## 16.1 Equipment Slots

Recommended slots:

```javascript
equipment: {
  weapon: null,
  offhand: null,
  armor: null,
  cloak: null,
  accessory1: null,
  accessory2: null
}
```

## 16.2 Equipment Commands

Supported commands:

```text
equip sword
wield sword
wear chainmail
put on cloak
unequip sword
remove chainmail
take off cloak
```

## 16.3 Equipping Logic

When equipping an item:

1. Check that the player possesses it.
2. Check that the item has an equipment slot.
3. Remove it from inventory.
4. Move currently equipped item from that slot back to inventory.
5. Place new item in slot.
6. Recalculate defense, weight, and encumbrance.
7. Advance time if appropriate.

Example:

```javascript
function equipItem(player, itemId) {
  const item = getItem(itemId);

  if (!item.slot) {
    return `You cannot equip ${item.name}.`;
  }

  if (!hasInventoryItem(player, itemId)) {
    return `You are not carrying ${item.name}.`;
  }

  const slot = item.slot;
  const currentlyEquipped = player.equipment[slot];

  removeInventoryItem(player, itemId, 1);

  if (currentlyEquipped) {
    addInventoryItem(player, currentlyEquipped, 1);
  }

  player.equipment[slot] = itemId;

  return `You equip ${item.name}.`;
}
```

---

# 17. Encumbrance System

## 17.1 Carry Capacity

Recommended formula:

$$
capacity = 50 + 10 \times might + 5 \times endurance
$$

Example code:

```javascript
function getCarryCapacity(player) {
  const might = player.stats.might || 0;
  const endurance = player.stats.endurance || 0;

  return 50 + 10 * might + 5 * endurance;
}
```

## 17.2 Encumbrance Tiers

Use coarse tiers.

| Load | State | Effect |
|---:|---|---|
| Up to $100\%$ capacity | `unencumbered` | No penalty |
| $101\%$ to $125\%$ capacity | `burdened` | Minor penalties |
| $126\%$ to $150\%$ capacity | `encumbered` | Moderate penalties |
| Above $150\%$ capacity | `overloaded` | Cannot travel normally |

Example code:

```javascript
function getEncumbranceState(player) {
  const weight = getCarriedWeight(player);
  const capacity = getCarryCapacity(player);
  const ratio = weight / capacity;

  if (ratio <= 1.0) return "unencumbered";
  if (ratio <= 1.25) return "burdened";
  if (ratio <= 1.5) return "encumbered";
  return "overloaded";
}
```

## 17.3 Penalties

Recommended penalties:

| State | Penalties |
|---|---|
| `unencumbered` | None |
| `burdened` | `stealth -1`, `agility checks -1` |
| `encumbered` | `stealth -2`, `agility checks -2`, travel takes $50\%$ longer |
| `overloaded` | Cannot move to another location until weight is reduced |

Example:

```javascript
const encumbranceEffects = {
  unencumbered: {
    agilityPenalty: 0,
    stealthPenalty: 0,
    travelTimeMultiplier: 1,
    canTravel: true
  },

  burdened: {
    agilityPenalty: -1,
    stealthPenalty: -1,
    travelTimeMultiplier: 1,
    canTravel: true
  },

  encumbered: {
    agilityPenalty: -2,
    stealthPenalty: -2,
    travelTimeMultiplier: 1.5,
    canTravel: true
  },

  overloaded: {
    agilityPenalty: -4,
    stealthPenalty: -4,
    travelTimeMultiplier: 2,
    canTravel: false
  }
};
```

## 17.4 Carried Weight Calculation

Equipped items count toward carried weight.

```javascript
function getCarriedWeight(player) {
  let total = 0;

  for (const entry of player.inventory) {
    const item = getItem(entry.itemId);
    total += (item.weight || 0) * entry.quantity;
  }

  for (const slot of Object.keys(player.equipment)) {
    const itemId = player.equipment[slot];
    if (!itemId) continue;

    const item = getItem(itemId);
    total += item.weight || 0;
  }

  return total;
}
```

## 17.5 Intent Behind This Decision

Encumbrance should matter, but not become tedious.

The player should clearly see:

```text
Carried Weight: 82 / 70 lb
Encumbrance: Burdened
Effects: Stealth -1, Agility checks -1
```

---

# 18. Armor, Defense, and Weapons

## 18.1 Defense Formula

Recommended formula:

$$
defense = 10 + agility + defenseSkill + armorDefenseBonus + shieldBonus
$$

Example:

```javascript
function getDefense(player) {
  const agility = player.stats.agility || 0;
  const defenseSkill = player.skills.defense || 0;

  const armor = getEquippedItem(player, "armor");
  const offhand = getEquippedItem(player, "offhand");

  const armorBonus = armor?.defenseBonus || 0;
  const shieldBonus = offhand?.shieldBonus || 0;

  return 10 + agility + defenseSkill + armorBonus + shieldBonus;
}
```

## 18.2 Armor Example

```javascript
{
  id: "chainmail",
  name: "chainmail",
  type: "armor",
  aliases: ["mail", "chain"],
  weight: 35,
  slot: "armor",
  defenseBonus: 3,
  stealthPenalty: -2,
  agilityPenalty: -1,
  value: 75
}
```

## 18.3 Weapon Example

```javascript
{
  id: "rusty_sword",
  name: "rusty sword",
  type: "weapon",
  aliases: ["sword", "blade"],
  weight: 3,
  slot: "weapon",
  skill: "melee",
  stat: "might",
  damage: "1d6",
  attackBonus: 0,
  value: 5
}
```

---

# 19. Combat System

## 19.1 Combat Philosophy

Combat should be simple, readable, and command-driven.

The player should not have to manage a full tactical grid.

Basic commands:

```text
attack goblin
shoot goblin
cast ember dart at goblin
flee
use potion
defend
```

## 19.2 Attack Formula

Recommended attack check:

$$
d20 + attackStat + weaponSkill + weaponBonus \geq targetDefense
$$

## 19.3 Damage

Weapons use dice strings such as:

```text
1d4
1d6
1d8
1d6+1
2d4
```

Example dice roller:

```javascript
function rollDice(dice) {
  const match = dice.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) throw new Error(`Invalid dice expression: ${dice}`);

  const count = Number(match[1]);
  const sides = Number(match[2]);
  const bonus = Number(match[3] || 0);

  let total = bonus;

  for (let i = 0; i < count; i++) {
    total += randomInt(1, sides);
  }

  return total;
}
```

## 19.4 Monster Behavior

Monsters may have:

```text
hostile
neutral
fleeing
guarding
patrolling
sleeping
afraid
surrendering
```

## 19.5 Morale

Not every enemy should fight to the death.

A morale check should happen when:

- enemy drops below half HP
- enemy drops below quarter HP
- leader dies
- enemy is outnumbered
- undead are exposed to holy power
- wolves encounter fire
- player has terrifying reputation

Morale check can use:

$$
d20 + will \geq moraleDifficulty
$$

---

# 20. NPCs and Monsters

## 20.1 NPC Schema

```javascript
const npc = {
  id: "borin_shopkeeper",
  name: "Borin the Shopkeeper",
  aliases: ["borin", "shopkeeper", "merchant"],
  type: "npc",

  description: "Borin is a broad man with careful eyes and ink-stained fingers.",

  stats: {
    might: 1,
    agility: 0,
    endurance: 1,
    intellect: 1,
    will: 1,
    presence: 2
  },

  skills: {
    persuasion: 2,
    lore: 1,
    melee: 0,
    defense: 0
  },

  resources: {
    hp: 12,
    maxHp: 12
  },

  defense: 10,

  disposition: {
    baseAttitude: 0,
    faction: "village"
  },

  dialogueId: "borin_dialogue",
  scheduleId: "borin_daily",
  defaultLocation: "general_store"
};
```

## 20.2 Monster Schema

```javascript
const monster = {
  id: "goblin_scout",
  name: "goblin scout",
  aliases: ["goblin", "scout"],
  type: "monster",

  description: "A wiry goblin with yellow eyes and a jagged knife.",

  stats: {
    might: 0,
    agility: 2,
    endurance: 0,
    intellect: -1,
    will: 0,
    presence: -1
  },

  skills: {
    stealth: 2,
    melee: 1,
    ranged: 1,
    defense: 1
  },

  resources: {
    hp: 8,
    maxHp: 8
  },

  defense: 13,

  attacks: [
    {
      id: "jagged_knife",
      name: "jagged knife",
      skill: "melee",
      stat: "agility",
      damage: "1d4+1"
    }
  ],

  behavior: {
    hostile: true,
    morale: 8,
    fleesAtHpPercent: 25
  },

  loot: [
    { itemId: "goblin_knife", chance: 60 },
    { itemId: "copper_coin", quantity: "1d6", chance: 80 }
  ],

  scheduleId: "goblin_patrol",
  defaultLocation: "north_wood"
};
```

---

# 21. Social Mechanics

## 21.1 NPC Attitude

NPCs should have attitude values.

| Attitude | Meaning |
|---:|---|
| -3 | Hostile |
| -2 | Suspicious |
| -1 | Unfriendly |
| 0 | Neutral |
| 1 | Friendly |
| 2 | Helpful |
| 3 | Loyal |

## 21.2 Social Checks

Social checks use the same core mechanic.

Examples:

```javascript
rollCheck(player, "presence", "persuasion", 12);
rollCheck(player, "presence", "deception", 14);
rollCheck(player, "might", "intimidation", 13);
```

Relevant modifiers may include:

- NPC attitude
- faction reputation
- player background
- previous flags
- clothing/equipment
- time of day
- bribes
- intimidation context

## 21.3 Reputation

Faction reputation should be stored as variables or within player state.

Example:

```javascript
reputation: {
  village: 1,
  church: 0,
  thieves_guild: 0,
  goblins: -1
}
```

Reputation can affect:

- prices
- dialogue
- quest availability
- guard reactions
- rumors
- endings
- ambushes

---

# 22. Flags, Variables, and Conditional Text

## 22.1 Flags

Flags represent boolean states.

Examples:

```javascript
flags: {
  met_innkeeper: true,
  opened_ancient_gate: false,
  defeated_goblin_chief: false
}
```

## 22.2 Variables

Variables represent numeric or string values.

Examples:

```javascript
variables: {
  village_reputation: 2,
  goblins_killed: 3,
  main_quest_stage: 1
}
```

## 22.3 Conditional Descriptions

Locations, dialogue, exits, and events may have condition arrays.

Example:

```javascript
descriptions: [
  {
    text: "An ancient stone gate bars your way.",
    conditions: [
      { flag: "opened_ancient_gate", equals: false }
    ]
  },
  {
    text: "The ancient gate stands open, revealing a path into darkness.",
    conditions: [
      { flag: "opened_ancient_gate", equals: true }
    ]
  }
]
```

## 22.4 Condition Operators

Recommended operators:

```text
equals
notEquals
gt
gte
lt
lte
hasItem
lacksItem
hasCondition
lacksCondition
timeBetween
npcAtLocation
```

## 22.5 Effects

Events and dialogue can apply effects.

Examples:

```javascript
effects: [
  { setFlag: "met_innkeeper", value: true },
  { addVariable: "village_reputation", amount: 1 },
  { giveItem: "old_iron_key", quantity: 1 },
  { removeItem: "silver_coin", quantity: 1 },
  { addCondition: "blessed", durationMinutes: 180 }
]
```

---

# 23. Location System

## 23.1 Location Schema

```javascript
const location = {
  id: "village_square",
  name: "Village Square",

  descriptions: [
    {
      text: "You stand in the muddy square of a small frontier village. A stone well sits in the center.",
      conditions: []
    }
  ],

  exits: {
    north: {
      to: "general_store",
      travelMinutes: 10,
      conditions: []
    },
    south: {
      to: "silver_stag_tavern",
      travelMinutes: 10,
      conditions: []
    }
  },

  items: ["village_notice"],

  tags: ["settlement", "outdoors"]
};
```

## 23.2 Dynamic Contents

The engine should determine visible NPCs and monsters dynamically using:

- static location contents
- world state
- NPC schedules
- monster schedules
- flags
- conditions

---

# 24. Time and Calendar System

## 24.1 Time Model

The game uses turn-based time.

Commands advance time by defined amounts.

Examples:

| Command Type | Time Advance |
|---|---:|
| `look` | 0 minutes |
| `inventory` | 0 minutes |
| Movement | usually 10 minutes |
| Talking | 5 minutes |
| Picking up item | 1 minute |
| Equipping armor | 5 minutes |
| Combat round | about 1 minute |
| Eating | 10 minutes |
| Waiting | specified by player |
| Sleeping | several hours |

## 24.2 Clock State

Recommended clock object:

```javascript
clock: {
  day: 1,
  hour: 8,
  minute: 0,
  month: "Frostwane"
}
```

## 24.3 Time Advancement

```javascript
function advanceTime(minutes) {
  state.clock.minute += minutes;

  while (state.clock.minute >= 60) {
    state.clock.minute -= 60;
    state.clock.hour += 1;
  }

  while (state.clock.hour >= 24) {
    state.clock.hour -= 24;
    state.clock.day += 1;
  }

  Game.conditions.update(minutes);
  Game.schedules.update();
}
```

## 24.4 Atmospheric Time Display

The game should display time in natural language.

Example:

```text
Late afternoon, third day of Frostwane
```

Recommended day phases:

| Time Range | Phase |
|---|---|
| 05:00–07:59 | Dawn |
| 08:00–11:59 | Morning |
| 12:00–13:59 | Midday |
| 14:00–16:59 | Afternoon |
| 17:00–18:59 | Late afternoon |
| 19:00–20:59 | Evening |
| 21:00–23:59 | Night |
| 00:00–04:59 | Deep night |

Ordinal day formatting:

```text
first
second
third
fourth
fifth
...
```

Example function intent:

```javascript
formatTime(clock);
// "Late afternoon, third day of Frostwane"
```

## 24.5 Intent Behind This Decision

Turn-based time gives the player control and supports schedules without punishing slow typing.

Atmospheric time display supports immersion better than showing only numeric time.

---

# 25. NPC and Monster Schedules

## 25.1 Schedule Philosophy

NPCs and monsters should move according to schedules.

Examples:

```text
Shopkeeper at store during day
Shopkeeper at tavern in evening
Shopkeeper at home sleeping at night
Goblin patrol moves through forest paths
Guards change posts at midnight
```

## 25.2 Schedule Schema

Use minutes after midnight.

```javascript
const schedule = {
  id: "borin_daily",
  entries: [
    {
      start: 360,
      end: 480,
      location: "borin_home",
      activity: "eating breakfast"
    },
    {
      start: 480,
      end: 1080,
      location: "general_store",
      activity: "working behind the counter"
    },
    {
      start: 1080,
      end: 1260,
      location: "silver_stag_tavern",
      activity: "drinking ale"
    },
    {
      start: 1260,
      end: 360,
      location: "borin_home",
      activity: "sleeping"
    }
  ]
};
```

Where:

- `360` means 06:00
- `480` means 08:00
- `1080` means 18:00
- `1260` means 21:00

## 25.3 Overnight Ranges

Schedules that cross midnight require special handling.

```javascript
function isTimeInRange(current, start, end) {
  if (start <= end) {
    return current >= start && current < end;
  }

  return current >= start || current < end;
}
```

## 25.4 Schedule Resolution

```javascript
function getScheduledLocation(entity, clock) {
  const schedule = getSchedule(entity.scheduleId);
  if (!schedule) return entity.defaultLocation;

  const current = clock.hour * 60 + clock.minute;

  const entry = schedule.entries.find(entry =>
    isTimeInRange(current, entry.start, entry.end)
  );

  return entry ? entry.location : entity.defaultLocation;
}
```

## 25.5 Intent Behind This Decision

Schedules make the world feel alive and integrate naturally with the turn-based clock.

They also create gameplay opportunities:

```text
The shop is closed at night.
The guard leaves the gate at midnight.
The black market appears only after dusk.
The vampire sleeps by day.
```

---

# 26. Conditions and Status Effects

## 26.1 Condition Examples

```text
poisoned
bleeding
wounded
tired
exhausted
hungry
afraid
blessed
cursed
drunk
invisible
diseased
encumbered
chilled
```

## 26.2 Player Condition Entry

```javascript
{
  id: "poisoned",
  severity: 1,
  remainingMinutes: 120
}
```

## 26.3 Condition Definition

```javascript
{
  id: "poisoned",
  name: "Poisoned",
  description: "Your body aches and your hands tremble.",
  modifiers: {
    endurance: -1,
    agility: -1
  }
}
```

## 26.4 Timed Conditions

When time advances, condition durations should decrease.

```javascript
function updateConditions(actor, minutes) {
  for (const condition of actor.conditions) {
    if (condition.remainingMinutes == null) continue;
    condition.remainingMinutes -= minutes;
  }

  actor.conditions = actor.conditions.filter(condition =>
    condition.remainingMinutes == null || condition.remainingMinutes > 0
  );
}
```

## 26.5 Inventory/Status Display

Conditions should be shown in the inventory/status screen.

Example:

```text
Status Effects:
- Poisoned: Your body aches and your hands tremble. Ends in about 2 hours.
- Tired: You need sleep. Stamina recovery is reduced.
```

---

# 27. Magic System

## 27.1 Magic Philosophy

Magic should be flavorful and relatively compact.

The system should support:

- utility spells
- combat spells
- ritual-like interactions
- conditional world effects
- mana or focus cost

## 27.2 Spell Schema

```javascript
const spell = {
  id: "witchlight",
  name: "Witchlight",
  aliases: ["light", "witchlight"],

  cost: {
    mana: 1
  },

  check: {
    stat: "will",
    skill: "magic",
    difficulty: 8
  },

  effects: [
    {
      setFlag: "player_has_light",
      value: true,
      durationMinutes: 180
    }
  ],

  successText: "A pale blue flame blossoms above your palm.",
  failureText: "The air chills, but the spell slips from your grasp."
};
```

## 27.3 Intent Behind This Decision

Magic should enrich exploration and problem-solving, not only combat.

Examples:

```text
cast witchlight
read runes
sense magic
ward door
speak with dead
break curse
```

---

# 28. Save, Load, Export, and Import

## 28.1 Local Save

Use `localStorage`.

Recommended keys:

```text
fantasyAdventure.save.slot1
fantasyAdventure.save.slot2
fantasyAdventure.save.slot3
fantasyAdventure.settings
fantasyAdventure.characterDraft
```

## 28.2 Save Data Structure

```javascript
const saveData = {
  version: "1.0.0",
  savedAt: "2026-05-18T12:00:00.000Z",

  mode: "playing",

  player: {},

  clock: {
    day: 3,
    hour: 17,
    minute: 30,
    month: "Frostwane"
  },

  flags: {},
  variables: {},

  world: {
    itemLocations: {},
    npcOverrides: {},
    monsterStates: {},
    locationStates: {}
  }
};
```

## 28.3 Export Save

Export should serialize save data to text.

Recommended simple approach:

```javascript
function exportSave(saveData) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(saveData))));
}
```

Better modern approach:

```javascript
function exportSave(saveData) {
  const json = JSON.stringify(saveData);
  return btoa(String.fromCharCode(...new TextEncoder().encode(json)));
}
```

The UI should provide a text area containing the exported save.

## 28.4 Import Save

Import should:

1. Decode save text.
2. Parse JSON.
3. Validate basic structure.
4. Check version.
5. Migrate if necessary.
6. Load into current state.

## 28.5 Save Versioning

Every save should include:

```javascript
version: "1.0.0"
```

Future engine versions should support migration functions.

Example:

```javascript
const migrations = {
  "1.0.0_to_1.1.0": function(save) {
    // modify old save structure
    return save;
  }
};
```

## 28.6 Intent Behind This Decision

Export/import is essential because browser storage is not permanent enough to be trusted as the only save mechanism.

---

# 29. Data Storage in Local Storage

## 29.1 Static Data

Static game data should normally remain embedded in the HTML file.

It does not need to be saved to `localStorage` unless the engine later supports player-edited content.

## 29.2 Dynamic Save State

Dynamic save state should be persisted.

Example:

```javascript
localStorage.setItem(
  "fantasyAdventure.save.slot1",
  JSON.stringify(saveData)
);
```

## 29.3 User Meaning of “Tables”

For this project, “tables” means JSON collections.

Examples:

```javascript
DATA.locations
DATA.items
DATA.npcs
DATA.monsters
DATA.schedules
DATA.backgrounds
```

---

# 30. UI Design

## 30.1 Interface Style

The game should have an old-school terminal-like interface.

Core UI elements:

```text
Output log
Command input line
Optional sidebar/status area
Optional buttons during character creation
Optional inventory/status panel
```

## 30.2 Output Log

The output log should show:

- room descriptions
- command echo
- action results
- dialogue
- combat text
- time changes when relevant
- warnings such as encumbrance

## 30.3 Input

The command input should accept text commands and submit on Enter.

## 30.4 Character Builder UI

Character builder can combine:

- clickable buttons
- text commands
- structured screens

Example:

```text
==================================================
CREATE YOUR CHARACTER
==================================================

Step 3 of 6: Allocate Stat Points

You have 6 points to spend.
No stat may be raised above 3.

Might:      0   [-] [+]
Agility:    0   [-] [+]
Endurance:  0   [-] [+]
Intellect:  0   [-] [+]
Will:       0   [-] [+]
Presence:   0   [-] [+]

Points remaining: 6

Commands:
increase might
decrease agility
set will 2
continue
back
help stats
==================================================
```

## 30.5 Intent Behind This Decision

Because this is HTML, the game can preserve the feel of a text adventure while using browser UI affordances where helpful.

---

# 31. World Data Examples

<details>
<summary>Example background table</summary>

```javascript
const backgroundTable = [
  {
    id: "village_hunter",
    name: "Village Hunter",
    description: "You know the old tracks, the deer paths, and the silence before danger.",

    statBonuses: {
      agility: 1,
      endurance: 1
    },

    skillBonuses: {
      survival: 2,
      ranged: 1,
      stealth: 1
    },

    startingItems: [
      { itemId: "hunting_bow", quantity: 1 },
      { itemId: "skinning_knife", quantity: 1 },
      { itemId: "travel_cloak", quantity: 1 },
      { itemId: "travel_rations", quantity: 3 },
      { itemId: "flint_and_steel", quantity: 1 }
    ],

    startingEquipment: {
      weapon: "hunting_bow",
      armor: "travel_cloak"
    },

    startingGold: 8,

    flags: {
      knows_forest_paths: true
    },

    reputation: {
      village: 1,
      goblins: -1
    }
  }
];
```

</details>

<details>
<summary>Example location table</summary>

```javascript
const locationTable = [
  {
    id: "village_square",
    name: "Village Square",

    descriptions: [
      {
        text: "You stand in the muddy square of a small frontier village. A stone well sits in the center.",
        conditions: []
      },
      {
        text: "The village square is quiet. The old well has collapsed into a dark pit.",
        conditions: [
          { flag: "well_collapsed", equals: true }
        ]
      }
    ],

    exits: {
      north: {
        to: "general_store",
        travelMinutes: 10,
        conditions: []
      },
      south: {
        to: "silver_stag_tavern",
        travelMinutes: 10,
        conditions: []
      },
      east: {
        to: "temple_yard",
        travelMinutes: 10,
        conditions: []
      }
    },

    items: ["village_notice"],

    tags: ["settlement", "outdoors"]
  }
];
```

</details>

<details>
<summary>Example item table</summary>

```javascript
const itemTable = [
  {
    id: "hunting_bow",
    name: "hunting bow",
    type: "weapon",
    aliases: ["bow"],
    description: "A simple but well-kept bow of yew wood.",
    weight: 2,
    stackable: false,
    portable: true,
    slot: "weapon",
    skill: "ranged",
    stat: "agility",
    damage: "1d6",
    attackBonus: 0,
    value: 15
  },
  {
    id: "travel_rations",
    name: "travel rations",
    type: "consumable",
    aliases: ["rations", "food"],
    description: "Dried meat, hard bread, and a little cheese wrapped in cloth.",
    weight: 1,
    stackable: true,
    portable: true,
    value: 1
  },
  {
    id: "old_iron_key",
    name: "old iron key",
    type: "key",
    aliases: ["key", "iron key"],
    description: "An old key with a dark red stain near the teeth.",
    weight: 0,
    stackable: false,
    portable: true,
    value: 0
  }
];
```

</details>

---

# 32. Implementation Roadmap

## Milestone 1: HTML Shell and UI

Build:

- self-contained HTML file
- CSS terminal interface
- output log
- command input
- basic `print()` function
- basic state object

Commands:

```text
help
clear
about
```

## Milestone 2: Parser

Build:

- command normalization
- verb aliases
- noun extraction
- preposition handling
- simple command routing

Commands:

```text
look
go north
inventory
help
```

## Milestone 3: World Navigation

Build:

- locations table
- exits
- room descriptions
- movement
- item visibility
- NPC visibility placeholder

Commands:

```text
look
go north
north
examine sign
```

## Milestone 4: Character Builder

Build:

- game modes
- name entry
- background choice
- stat allocation
- skill choice
- character confirmation
- starting inventory/equipment

## Milestone 5: Inventory and Equipment

Build:

- inventory screen
- item table
- take/drop
- equip/unequip
- weight calculation
- equipment slots

## Milestone 6: Encumbrance

Build:

- carry capacity
- encumbrance tiers
- penalties
- travel time modifiers
- pickup warnings

## Milestone 7: Checks and Dice

Build:

- dice roller
- `rollCheck()`
- difficulty scale
- degrees of success
- hidden results
- optional debug mode

## Milestone 8: Clock and Calendar

Build:

- turn-based time
- atmospheric time display
- wait command
- time costs for commands
- condition duration ticking

## Milestone 9: NPCs and Schedules

Build:

- NPC table
- schedule table
- schedule resolution
- dynamic room presence
- shopkeeper daily routine

## Milestone 10: Save/Load/Export/Import

Build:

- local save
- local load
- reset
- export save text
- import save text
- version validation

## Milestone 11: Combat and Conditions

Build:

- simple attack command
- monster HP
- weapon damage
- defense
- conditions
- death/defeat states
- morale

## Milestone 12: Dialogue and Quests

Build:

- talk command
- conditional dialogue
- reputation effects
- quest flags
- rewards

---

# 33. Known Limitations

## 33.1 Local Storage Size

`localStorage` is usually limited to around 5 MB to 10 MB depending on browser.

This is enough for text-heavy game data and several saves, but not good for:

- large images
- audio
- huge procedural maps
- many large save slots

## 33.2 Client-Side Modifiability

Players can inspect and modify game data.

This is acceptable because the game is single-player and offline.

## 33.3 Browser Storage Risk

Saves can be lost if browser storage is cleared.

This is why export/import is mandatory.

## 33.4 Parser Ambiguity

Intermediate parser will not understand everything.

The game should provide helpful fallback messages.

Bad:

```text
I don't understand.
```

Better:

```text
I do not know what you mean by "old thing." Try "look at old sword" or "take old sword."
```

---

# 34. Future Expansion Ideas

Possible future systems:

```text
Crafting
Containers and nested inventory
Light and darkness
Weather
Seasons
Hunger and thirst
Procedural rumors
Faction wars
Companion NPCs
Advanced dialogue trees
Shop economy
Repair and item durability
Stealth mode
Crime and law system
Multiple endings
Bestiary
Journal
Quest log
Automap
```

These should not be required for the first engine version.

---

# 35. Minimum Viable Vertical Slice

Before building a large world, create a small test scenario.

Recommended vertical slice:

```text
Village Square
General Store
Silver Stag Tavern
Borin the Shopkeeper
One goblin
One weapon
One armor item
One key
One locked door
One flag-based event
One schedule
One hidden skill check
One save/export/import path
```

Required commands for the vertical slice:

```text
look
go north
north
talk to borin
inventory
take item
drop item
equip item
unequip item
wait
attack goblin
save
load
export save
import save
```

This proves the core engine works before expanding content.

---

# 36. Final Design Summary

The agreed design is a **single-file HTML fantasy text RPG engine** with:

- old-school text adventure interface
- intermediate command parser
- modular JSON collections
- stable IDs for all entities
- character builder
- six core stats
- skill system
- hidden $d20$ checks
- degrees of success
- inventory/status screen
- equipment slots
- item weight
- encumbrance penalties
- HP, stamina, optional mana
- conditions and status effects
- turn-based clock
- atmospheric time display
- NPC and monster schedules
- flags and variables
- conditional text
- local save/load
- mandatory export/import save system

The key implementation principle is:

> The player should interact naturally through prose commands, while the engine quietly handles structured RPG mechanics in the background.

This document should be treated as the source of truth for the initial engine build.