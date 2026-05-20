/**
 * Static game data.
 *
 * All arrays are initialised empty.
 * Content will be added later during vertical-slice and world-data phases.
 * The ID field for every entity type is required and must be a stable
 * lowercase string  see section 6.1 of the design document.
 *
 * @type {{
 *   version: string,
 *   locations: Array<{id: string}>,
 *   items: Array<{id: string}>,
 *   npcs: Array<{id: string}>,
 *   monsters: Array<{id: string}>,
 *   backgrounds: Array<{id: string}>,
 *   schedules: Array<{id: string}>,
 *   dialogues: Array<{id: string}>,
 *   conditions: Array<{id: string}>,
 *   spells: Array<{id: string}>,
 *   quests: Array<{id: string}>,
 *   skills: Array<{id: string}>
 * }}
 */
const DATA = {
  /**
   * Engine / data-schema version.
   * Increment when the static-data structure changes.
   */
  version: "1.0.0",

  // ----------------------------------------------------------------
  // §5.1 / §6.1  Static game data collections
  // ----------------------------------------------------------------

  /**
   * §6.1 Location.id  stable lowercase identifier (e.g. "village_square")
   * §23.1 Location schema  id, name, descriptions, exits, items, tags
   */
  locations: [],

  /**
   * §6.1 Item.id  stable lowercase identifier (e.g. "iron_sword")
   * §15.1 Item schema  id, name, type, aliases, description, weight,
   *                    stackable, portable, slot, stat, skill, damage,
   *                    attackBonus, value
   */
  items: [],

  /**
   * §6.1 NPC.id  stable lowercase identifier (e.g. "borin_shopkeeper")
   * §20.1 NPC schema  id, name, aliases, type, description, stats, skills,
   *                   resources, defense, disposition, dialogueId,
   *                   scheduleId, defaultLocation
   */
  npcs: [],

  /**
   * §6.1 Monster.id  stable lowercase identifier (e.g. "goblin_scout")
   * §20.2 Monster schema  id, name, aliases, type, description, stats,
   *                       skills, resources, defense, attacks, behavior,
   *                       loot, scheduleId, defaultLocation
   */
  monsters: [],

  /**
   * §6.1 Background.id  stable lowercase identifier (e.g. "village_hunter")
   * §12.4 / §31  Background schema  id, name, description, statBonuses,
   *               skillBonuses, startingItems, startingEquipment,
   *               startingGold, flags, reputation
   */
  backgrounds: [],

  /**
   * §6.1 Schedule.id  stable lowercase identifier (e.g. "borin_daily")
   * §25.2 Schedule schema  id, entries  [{start, end, location, activity}]
   *   start / end are minutes after midnight (0 - 1439)
   *   end < start  overnight range (crosses midnight)
   */
  schedules: [],

  /**
   * §6.1 Dialogue.id  stable lowercase identifier (e.g. "borin_dialogue")
   * §20.1 npc.dialogueId  references the dialogue to show when talking to this NPC
   * §22  Dialogue can carry conditions, effects, and conditional text branches
   */
  dialogues: [],

  /**
   * §6.1 Condition.id  stable lowercase identifier (e.g. "poisoned")
   * §26.3 Condition definition  id, name, description, modifiers
   * §26.2 Player condition instance  id, severity, remainingMinutes
   */
  conditions: [],

  /**
   * §6.1 Spell.id  stable lowercase identifier (e.g. "witchlight")
   * §27.2 Spell schema  id, name, aliases, cost, check, effects,
   *                     successText, failureText
   */
  spells: [],

  /**
   * §6.1 Quest.id  stable lowercase identifier (e.g. "find_missing_sheep")
   * §31  Quest schema (to be defined)  id, name, description, stages,
   *             rewards, conditions, flags_set_on_complete
   */
  quests: [],

  /**
   * §6.1 Skill.id  stable lowercase identifier (e.g. "melee")
   * §11  Skill list  athletics, stealth, thievery, survival, lore,
   *                  investigation, persuasion, deception, intimidation,
   *                  melee, ranged, defense, magic
   */
  skills: [],
};
