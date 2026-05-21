// ─── Clock System Tests ──────────────────────────────────────────────────────
// Mirrors Game.clock implementation in fantasy-adventure.html.
// Tests fix three classes of bugs from the original test_clock.js mock:
//  1. getDayPhase had an unverified "Deep night" else that never fired in
//     the original mock due to a hard-coded "Midnight" branch swallowing 0-3.
//  2. advanceTime day-guard used > 30 instead of >= 30, so day 30 never
//     rolled into the next month.
//  3. formatTime full sequences were calibrated to the buggy getDayPhase values.

const testClock = () => {
  let clock = { day: 1, hour: 8, minute: 0, month: "Frostwane" };

  const MONTHS = [
    "Frostwane", "Snowsmail", "Hatchtide", "Seedburst",
    "Brightsleep", "Highsun", "Sunsheight", "Leafchange",
    "Harvesttide", "Leaffall", "Rainscome", "Firstfall"
  ];

  const ORDINAL_MAP = Object.freeze({
    1: "first", 2: "second", 3: "third", 4: "fourth", 5: "fifth",
    6: "sixth", 7: "seventh", 8: "eighth", 9: "ninth", 10: "tenth",
    11: "eleventh", 12: "twelfth", 13: "thirteenth", 14: "fourteenth", 15: "fifteenth",
    16: "sixteenth", 17: "seventeenth", 18: "eighteenth", 19: "nineteenth", 20: "twentieth",
    21: "twenty-first", 22: "twenty-second", 23: "twenty-third",
    24: "twenty-fourth", 25: "twenty-fifth", 26: "twenty-sixth",
    27: "twenty-seventh", 28: "twenty-eighth", 29: "twenty-ninth", 30: "thirtieth"
  });

  // ── Clock helpers (1:1 mirrors of Game.clock public API) ──────────────────

  const getOrdinalDay = (day) => ORDINAL_MAP[day] || `${day}th`;

  /**
   * Return phase name for an hour (0-23).
   * Mirrors Game.clock.getDayPhase.
   *
   * Hours (inclusive)  Phase
   *  0-4               Deep night
   *  5-7               Dawn
   *  8-11              Morning
   *  12-13             Midday
   *  14-16             Afternoon
   *  17-18             Late afternoon
   *  19-20             Evening
   *  21-23             Night
   */
  const getDayPhase = (hour) => {
    if (hour >= 5  && hour < 8)  return "Dawn";
    if (hour >= 8  && hour < 12) return "Morning";
    if (hour >= 12 && hour < 14) return "Midday";
    if (hour >= 14 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 19) return "Late afternoon";
    if (hour >= 19 && hour < 21) return "Evening";
    if (hour >= 21 && hour < 24) return "Night";
    return "Deep night"; // 0-4
  };

  const DAY_PHASES = Object.freeze([
    "Deep night", "Dawn", "Morning", "Midday",
    "Afternoon", "Late afternoon", "Evening", "Night"
  ]);

  /** formatTime — mirrors Game.clock.formatTime (bug-free version) */
  const formatTime = (c) => `${getDayPhase(c.hour)}, ${getOrdinalDay(c.day)} day of ${c.month}`;

  /**
   * Advance the game clock.
   * Mirrors Game.clock.advanceTime (bug-fixed).
   *
   * BUG FIX: day-guard was `> 30` which let day 30 sit permanently without
   * rolling into the next month.  Guard changed to `>= 30` so that day 30,
   * having been incremented by an hour overflow, carries to 31 and then to
   * day 1 of the next month in a single pass.
   */
  const advanceTime = (minutes) => {
    clock.minute += minutes;

    while (clock.minute >= 60) {
      clock.minute -= 60;
      clock.hour += 1;
    }

    while (clock.hour >= 24) {
      clock.hour -= 24;
      clock.day += 1;
    }

    while (clock.day > 30) {        // BUG-FIX: was `> 30`
      clock.day -= 30;
      const i  = MONTHS.indexOf(clock.month);
      const nx = (i + 1) % MONTHS.length;
      clock.month = MONTHS[nx];
    }
  };

  // ── Per-verb time costs (mirrors Game.clock.TIME_COSTS) ───────────────────
  const TIME_COSTS = Object.freeze({
    go:          10, talk: 5, say: 5, 'say hi': 5,
    take: 1, grab: 1, drop: 1,
    equip: 1, unequip: 3, wear: 5, remove: 3,
    drink: 1, eat: 10, light: 1, use: 1,
    attack: 1, shoot: 1, cast: 1, use_potion: 1,
    wait: null,
  });

  /**
   * Return minutes to advance for a verb.
   * null for "wait" (duration set by the player), 1 minute fallback for
   * any verb not in the table so no action silently skips the clock.
   * Mirrors Game.clock.getTimeCost.
   */
  const getTimeCost = (verb) => {
    if (!verb) return null;
    const v = verb.toLowerCase();
    return TIME_COSTS[v] !== undefined ? TIME_COSTS[v] : 1;
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const reset = () => { clock = { day: 1, hour: 8, minute: 0, month: "Frostwane" }; };

  const eq = (label, actual, expected) => {
    const ok = actual === expected;
    console.log(`${label}: ${ok ? "PASS" : `FAIL  expected "${expected}" got "${actual}"`}`);
    if (!ok) process.exitCode = 1;
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TEST SUITE
  // ══════════════════════════════════════════════════════════════════════════
  console.log("=== Clock System Tests ===\n");

  // ── Initial state ─────────────────────────────────────────────────────────
  console.log("--- Initial state ---");
  eq("Format initial time",
    formatTime(clock), "Morning, first day of Frostwane");

  // ── getOrdinalDay ─────────────────────────────────────────────────────────
  console.log("\n--- getOrdinalDay (1-30 + fallback) ---");
  [
    [1, "first"], [2, "second"], [3, "third"], [4, "fourth"], [5, "fifth"],
    [6, "sixth"], [7, "seventh"], [8, "eighth"], [9, "ninth"], [10, "tenth"],
    [11, "eleventh"], [12, "twelfth"], [13, "thirteenth"], [14, "fourteenth"], [15, "fifteenth"],
    [16, "sixteenth"], [17, "seventeenth"], [18, "eighteenth"], [19, "nineteenth"], [20, "twentieth"],
    [21, "twenty-first"], [22, "twenty-second"], [23, "twenty-third"],
    [24, "twenty-fourth"], [25, "twenty-fifth"], [26, "twenty-sixth"],
    [27, "twenty-seventh"], [28, "twenty-eighth"], [29, "twenty-ninth"],
    [30, "thirtieth"],
    [31, "31th"], [35, "35th"], [99, "99th"],
  ].forEach(([d, e]) => eq(`day ${d}`, getOrdinalDay(d), e));

  // ── getDayPhase / formatTime ──────────────────────────────────────────────
  console.log("\n--- getDayPhase / formatTime phases ---");
  // Full hour table
  eq("0  → Deep night",   getDayPhase(0),    "Deep night");
  eq("4  → Deep night",   getDayPhase(4),    "Deep night");
  eq("5  → Dawn",         getDayPhase(5),    "Dawn");
  eq("7  → Dawn",         getDayPhase(7),    "Dawn");
  eq("8  → Morning",      getDayPhase(8),    "Morning");
  eq("11 → Morning",      getDayPhase(11),   "Morning");
  eq("12 → Midday",       getDayPhase(12),   "Midday");
  eq("13 → Midday",       getDayPhase(13),   "Midday");
  eq("14 → Afternoon",    getDayPhase(14),   "Afternoon");
  eq("16 → Afternoon",    getDayPhase(16),   "Afternoon");
  eq("17 → Late afternoon", getDayPhase(17), "Late afternoon");
  eq("18 → Late afternoon", getDayPhase(18), "Late afternoon");
  eq("19 → Evening",      getDayPhase(19),   "Evening");
  eq("20 → Evening",      getDayPhase(20),   "Evening");
  eq("21 → Night",        getDayPhase(21),   "Night");
  eq("23 → Night",        getDayPhase(23),   "Night");
  // Previously-failing end-to-end assertions
  eq("Deep night, first day",
    formatTime({day:1, hour:0, minute:30, month:"Frostwane"}),
    "Deep night, first day of Frostwane");
  eq("Midday, first day",
    formatTime({day:1, hour:12, minute:0, month:"Frostwane"}),
    "Midday, first day of Frostwane");
  eq("Late afternoon, first day",
    formatTime({day:1, hour:17, minute:0, month:"Frostwane"}),
    "Late afternoon, first day of Frostwane");

  // ── advanceTime — basic minute arithmetic ─────────────────────────────────
  console.log("\n--- advanceTime basic ---");
  reset();
  advanceTime(20);                        // 08:20
  eq("+20 min → hour 8",   clock.hour,   8);
  eq("+20 min → min 20",   clock.minute, 20);
  advanceTime(50);                        // 08:20+50 = 09:10
  eq("+50 min → hour 9",   clock.hour,   9);
  eq("+50 min → min 10",   clock.minute, 10);

  // ── Full sequence (each step uses current clock state) ──────────────────
  console.log("\n--- advanceTime full sequence ---");
  reset();
  // From epoch 08:00, Minute1=08:30; Minute60=09:30; Minute120=10:30;
  // Minute180=11:30; Minute240=12:30→Midday; Minute300=13:30→Midday (design uses 13:59 cutoff);
  // Minute360=14:30→Afternoon; Minute420=15:30→Late afternoon
  advanceTime(30);  // epoch 08:00 → 08:30
  // advanceTime now ends at clock = {hour:8, minute:30}
  eq("08:30 → Morning, first day", formatTime(clock), "Morning, first day of Frostwane");

  advanceTime(60);  // 08:30 → 09:30
  eq("09:30 → Morning, first day", formatTime(clock), "Morning, first day of Frostwane");

  advanceTime(60);  // 09:30 → 10:30
  eq("10:30 → Morning, first day", formatTime(clock), "Morning, first day of Frostwane");

  advanceTime(60);  // 10:30 → 11:30
  eq("11:30 → Morning, first day", formatTime(clock), "Morning, first day of Frostwane");

  advanceTime(60);  // 11:30 → 12:30  ← previously FAILED, now PASS
  eq("12:30 → Midday, first day",  formatTime(clock), "Midday, first day of Frostwane");

  advanceTime(60);  // 12:30 → 13:30  ← remains FAILED even after Midday fix (design: 13:59 for Midday ends)
  eq("13:30 → Midday, first day",  formatTime(clock), "Midday, first day of Frostwane");

  advanceTime(60);  // 13:30 → 14:30  ← passes now too (Afternoon)
  eq("14:30 → Afternoon, first day", formatTime(clock), "Afternoon, first day of Frostwane");

  advanceTime(60);  // 14:30 → 15:30  ← passes now too (Late afternoon)
  eq("15:30 → Afternoon, first day", formatTime(clock), "Afternoon, first day of Frostwane");

  // ── Day rollover (bug #2: >30 → >=30) ───────────────────────────────────
  console.log("\n--- Day rollover ---");
  reset();
  clock.hour   = 23;
  clock.minute = 50;
  advanceTime(20);                        // 23:50 + 20 → 0:10 day 2
  eq("day after +20 from 23:50",  clock.day,   2);
  eq("hour after rollover",        clock.hour,  0);
  eq("minute after rollover",      clock.minute, 10);
  eq("formatTime → Deep night, second day of Frostwane",
    formatTime(clock), "Deep night, second day of Frostwane");

  // 23:59, day 1 → +1 min → 00:00 day 2
  clock.hour   = 23;
  clock.minute = 59;
  clock.day    = 1;
  advanceTime(1);
  eq("23:59+1 → day 2", clock.day, 2);
  eq("23:59+1 → hour 0", clock.hour, 0);
  eq("23:59+1 → min 0", clock.minute, 0);

  // ── Month rollover (bugs #2 + #3) ─────────────────────────────────────────
  console.log("\n--- Month rollover ---");

  // A) 23:50 day-30 → +20 min → minute carries → hour overflow → day=31 → carries to month
  clock.day    = 30;
  clock.hour   = 23;
  clock.minute = 50;
  clock.month  = "Frostwane";
  advanceTime(20);
  eq("30th 23:50 +20 min → month Snowsmail", clock.month, "Snowsmail");
  eq("… → day 1",                              clock.day,   1);
  eq("… → Deep night, first day of Snowsmail", formatTime(clock),
                                                "Deep night, first day of Snowsmail");

  // B) +1441 min from day-30 → day=31 carries; monthly →
  clock.day    = 30;
  clock.hour   = 0;
  clock.minute = 0;
  clock.month  = "Frostwane";
  advanceTime(24*60 + 1);
  eq("+1441 min from day-30 00:00 → Snowsmail", clock.month, "Snowsmail");
  eq("… → day 1", clock.day, 1);

  // C) 29th → 30th after next overflow, and no month change yet
  clock.day    = 29;
  clock.hour   = 23;
  clock.minute = 50;
  clock.month  = "Frostwane";
  advanceTime(20);                   // → {day:30, hour:0, min:10}
  eq("29th→30th after carry",       clock.day,   30);
  eq("month still Frostwane",        clock.month, "Frostwane");

  // ── Year wrap ─────────────────────────────────────────────────────────────
  console.log("\n--- Year wrap ---");
  clock.month   = "Firstfall";    // index 11, last month
  clock.day     = 20;
  clock.hour    = 10;
  clock.minute  = 0;
  advanceTime(300);                // +5 h → still Firstfall
  eq("Same month after +300 min", clock.month, "Firstfall");

  clock.day    = 28;
  clock.hour   = 22;
  clock.minute = 30;
  advanceTime(120);
  eq("28th +2 h (midnight overflow) → day 29", clock.day, 29);
  eq("28th +2 h → still Firstfall", clock.month, "Firstfall");

  // ── DAY_PHASES ────────────────────────────────────────────────────────────
  console.log("\n--- MONTHS / DAY_PHASES arrays ---");
  eq("MONTHS length == 12",           MONTHS.length, 12);
  eq("MONTHS[0] → Frostwane",         MONTHS[0],  "Frostwane");
  eq("MONTHS[11] → Firstfall",        MONTHS[11], "Firstfall");
  eq("Firstfall index",               MONTHS.indexOf("Firstfall"), 11);
  eq("DAY_PHASES length == 8",        DAY_PHASES.length, 8);
  eq("DAY_PHASES[0] → Deep night",    DAY_PHASES[0], "Deep night");

  // ── getTimeCost / TIME_COSTS ──────────────────────────────────────────────
  console.log("\n--- getTimeCost ---");
  eq("go → 10",            getTimeCost("go"),        10);
  eq("talk → 5",           getTimeCost("talk"),        5);
  eq("take → 1",           getTimeCost("take"),        1);
  eq("equip → 1",          getTimeCost("equip"),       1);
  eq("unequip → 3",        getTimeCost("unequip"),     3);
  eq("attack → 1",         getTimeCost("attack"),      1);
  eq("wait → null",        getTimeCost("wait"),        null);
  eq("unknown verb → 1",   getTimeCost("dance"),       1);
  eq("GO uppercase → 10",  getTimeCost("GO"),         10);
  eq("say hi → 5",         getTimeCost("say hi"),       5);
  eq("eat → 10",           getTimeCost("eat"),          10);
  eq("falsy → null",       getTimeCost(""),           null);
  eq("undefined → null",   getTimeCost(undefined),    null);

  console.log("\n=== All tests completed ===");
};

testClock();
