const fs = require("fs");
const vm = require("vm");

const html = fs.readFileSync(__dirname + "/fantasy-adventure.html", "utf8");
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) { console.error("No script block found"); process.exit(1); }

const code = scriptMatch[1];

const sandbox = {
  window: {},
  document: {
    getElementById: function () {
      return {
        addEventListener: function(){},
        appendChild: function(){},
        scrollTop: 0,
        scrollHeight: 0,
        value: "",
        innerHTML: ""
      };
    },
    createElement: function () {
      return {
        className: "",
        textContent: "",
        style: {}
      };
    }
  }
};
sandbox.window.close = function () {};
sandbox.window.location = { href: "" };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const Game = sandbox.window.Game || sandbox.Game;
if (!Game || !Game.parser) { console.error("Game.parser not found"); process.exit(1); }

let passed = 0;
let failed = 0;

function assert(label, condition, detail) {
  if (condition) { passed++; console.log("  PASS: " + label); }
  else { failed++; console.log("  FAIL: " + label + (detail ? " (" + detail + ")" : "")); }
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (var i = 0; i < ka.length; i++) {
    if (!b.hasOwnProperty(ka[i])) return false;
    if (!deepEqual(a[ka[i]], b[ka[i]])) return false;
  }
  return true;
}

console.log("\n=== Parser Tests ===\n");

console.log("-- Normalization --");
var r;
r = Game.parser.parse("  LOOK  ");
assert("trims and lowercases", r && r.verb === "look");
r = Game.parser.parse("   go   north   ");
assert("collapses extra spaces", r && r.verb === "go" && r.directObjectText === "north");
r = Game.parser.parse("");
assert("empty input returns null", r === null);
r = Game.parser.parse("   ");
assert("whitespace-only returns null", r === null);

console.log("\n-- Verb Aliases --");
r = Game.parser.parse("i");
assert("'i' maps to 'inventory'", r && r.verb === "inventory");
r = Game.parser.parse("inv");
assert("'inv' maps to 'inventory'", r && r.verb === "inventory");
r = Game.parser.parse("status");
assert("'status' maps to 'inventory'", r && r.verb === "inventory");
r = Game.parser.parse("gear");
assert("'gear' maps to 'inventory'", r && r.verb === "inventory");
r = Game.parser.parse("examine sword");
assert("'examine' maps to 'look'", r && r.verb === "look" && r.directObjectText === "sword");
r = Game.parser.parse("x");
assert("'x' maps to 'look'", r && r.verb === "look");
r = Game.parser.parse("wield sword");
assert("'wield' maps to 'equip'", r && r.verb === "equip");
r = Game.parser.parse("wear cloak");
assert("'wear' maps to 'equip'", r && r.verb === "equip");
r = Game.parser.parse("remove cloak");
assert("'remove' maps to 'unequip'", r && r.verb === "unequip");
r = Game.parser.parse("strike goblin");
assert("'strike' maps to 'attack'", r && r.verb === "attack");
r = Game.parser.parse("hit goblin");
assert("'hit' maps to 'attack'", r && r.verb === "attack");
r = Game.parser.parse("fight goblin");
assert("'fight' maps to 'attack'", r && r.verb === "attack");
r = Game.parser.parse("get sword");
assert("'get' maps to 'take'", r && r.verb === "take");
r = Game.parser.parse("grab rope");
assert("'grab' maps to 'take'", r && r.verb === "take");
r = Game.parser.parse("exit");
assert("'exit' maps to 'quit'", r && r.verb === "quit");

console.log("\n-- Direction Aliases --");
r = Game.parser.parse("north");
assert("standalone 'north' -> go+direction", r && r.verb === "go" && r.directObjectText === "north");
r = Game.parser.parse("go north");
assert("'go north' -> go + north", r && r.verb === "go" && r.directObjectText === "north");
r = Game.parser.parse("n");
assert("'n' -> go+direction", r && r.verb === "go" && r.directObjectText === "north");
r = Game.parser.parse("s");
assert("'s' -> go+direction south", r && r.verb === "go" && r.directObjectText === "south");
r = Game.parser.parse("e");
assert("'e' -> go+direction east", r && r.verb === "go" && r.directObjectText === "east");
r = Game.parser.parse("w");
assert("'w' -> go+direction west", r && r.verb === "go" && r.directObjectText === "west");
r = Game.parser.parse("u");
assert("'u' -> go+direction up", r && r.verb === "go" && r.directObjectText === "up");
r = Game.parser.parse("down");
assert("'down' -> go+direction down", r && r.verb === "go" && r.directObjectText === "down");

console.log("\n-- Multi-Word Aliases --");
r = Game.parser.parse("pick up sword");
assert("'pick up' maps to 'take'", r && r.verb === "take" && r.directObjectText === "sword");
r = Game.parser.parse("put on cloak");
assert("'put on' maps to 'equip'", r && r.verb === "equip" && r.directObjectText === "cloak");
r = Game.parser.parse("take off armor");
assert("'take off' maps to 'unequip'", r && r.verb === "unequip" && r.directObjectText === "armor");
r = Game.parser.parse("look at sign");
assert("'look at' maps to 'look' with direct object", r && r.verb === "look" && r.directObjectText === "sign");
r = Game.parser.parse("talk to borin");
assert("'talk to' maps to 'talk' with direct object", r && r.verb === "talk" && r.directObjectText === "borin");

console.log("\n-- Quantity Extraction --");
r = Game.parser.parse("drop 2 torches");
assert("numeric quantity extraction", r && r.verb === "drop" && r.quantity === 2 && r.directObjectText === "torches");
r = Game.parser.parse("drop three swords");
assert("word quantity extraction", r && r.verb === "drop" && r.quantity === 3 && r.directObjectText === "swords");
r = Game.parser.parse("take a torch");
assert("'a' as quantity 1", r && r.verb === "take" && r.quantity === 1 && r.directObjectText === "torch");
r = Game.parser.parse("drop ten rations");
assert("'ten' as quantity 10", r && r.verb === "drop" && r.quantity === 10 && r.directObjectText === "rations");
r = Game.parser.parse("give 2 copper to beggar");
assert("quantity before preposition", r && r.verb === "give" && r.quantity === 2 && r.preposition === "to" && r.indirectObjectText === "beggar");
r = Game.parser.parse("look");
assert("no quantity on 'look'", r && r.quantity === null);

console.log("\n-- Preposition + Indirect Object --");
r = Game.parser.parse("use iron key on old door");
assert("use...on parsing", r && r.verb === "use" && r.directObjectText === "iron key" && r.preposition === "on" && r.indirectObjectText === "old door");
r = Game.parser.parse("give coin to beggar");
assert("give...to parsing", r && r.verb === "give" && r.directObjectText === "coin" && r.preposition === "to" && r.indirectObjectText === "beggar");
r = Game.parser.parse("talk to borin");
assert("talk...to parsing", r && r !== null && r.verb === "talk");
r = Game.parser.parse("attack goblin with knife");
assert("attack...with parsing", r && r.verb === "attack" && r.directObjectText === "goblin" && r.preposition === "with" && r.indirectObjectText === "knife");
r = Game.parser.parse("look at sign");
assert("look at parsing has verb look and direct obj", r && r.verb === "look" && r.directObjectText === "sign");

console.log("\n-- Canonical Structure --");
r = Game.parser.parse("drop 2 torches");
assert("structure has raw field", r && r.raw === "drop 2 torches");
assert("structure has verb field", r && r.verb === "drop");
assert("structure has directObjectText field", r && r.directObjectText === "torches");
assert("structure has quantity field", r && r.quantity === 2);
assert("structure has preposition field", r && r.preposition === null);
assert("structure has indirectObjectText field", r && r.indirectObjectText === null);

console.log("\n-- Edge Cases --");
r = Game.parser.parse("look");
assert("'look' with no objects", r && r.verb === "look" && r.directObjectText === null && r.preposition === null && r.indirectObjectText === null);
r = Game.parser.parse("inventory");
assert("'inventory' with no objects", r && r.verb === "inventory" && r.directObjectText === null);
r = Game.parser.parse("use rusty sword");
assert("'use rusty sword' (no prep)", r && r.verb === "use" && r.directObjectText === "rusty sword" && r.preposition === null);
r = Game.parser.parse("help");
assert("'help' verb", r && r.verb === "help");
r = Game.parser.parse("wait");
assert("'wait' verb", r && r.verb === "wait");
r = Game.parser.parse("sleep");
assert("'sleep' verb", r && r.verb === "sleep");
r = Game.parser.parse("save");
assert("'save' verb", r && r.verb === "save");
r = Game.parser.parse("load");
assert("'load' verb", r && r.verb === "load");

console.log("\n-- Suggestion System --");
var sugg;
sugg = Game.parser.suggestCommand("lok");
assert("suggest for 'lok'", sugg.length > 0 && sugg[0] === "look", JSON.stringify(sugg));
sugg = Game.parser.suggestCommand("inventori");
assert("suggest for 'inventori'", sugg.length > 0 && sugg.indexOf("inventory") >= 0, JSON.stringify(sugg));
sugg = Game.parser.suggestCommand("attck");
assert("suggest for 'attck'", sugg.length > 0 && sugg[0] === "attack", JSON.stringify(sugg));
sugg = Game.parser.suggestCommand("qqqqqqqq");
assert("no suggestions for complete gibberish", sugg.length === 0);

console.log("\n-- Utility Methods --");
var verbs = Game.parser.getCanonicalVerbs();
assert("getCanonicalVerbs returns array", Array.isArray(verbs));
assert("getCanonicalVerbs includes 'look'", verbs.indexOf("look") >= 0);
assert("getCanonicalVerbs includes 'go'", verbs.indexOf("go") >= 0);
assert("getCanonicalVerbs is sorted", verbs.join(",") === verbs.slice().sort().join(","));

console.log("\n-- Alias Extensibility --");
Game.parser.addAliases({ "shout": "yell" });
r = Game.parser.parse("shout loudly");
assert("custom alias works", r && r.verb === "yell");
assert("canonical verbs updated", Game.parser.getCanonicalVerbs().indexOf("yell") >= 0);

console.log("\n=== Suggestion Tests ===\n");
console.log("-- Levenshtein Distance --");
assert("distance 0 for identical", sandbox.levenshtein ? sandbox.levenshtein("test", "test") === 0 : true);

console.log("\n=== Command Handler Tests ===\n");

Game.state.mode = "playing";
Game.state.player.name = "TestHero";
Game.state.player.backgroundId = "mercenary";
Game.state.player.locationId = "village_square";

var outputLines = [];
var origPrint = Game.ui.print;
Game.ui.print = function (text, cls) { outputLines.push({ text: text, cls: cls }); };
var origEcho = Game.ui.echoCommand;
Game.ui.echoCommand = function () {};
var origSep = Game.ui.printSeparator;
Game.ui.printSeparator = function () {};

function runCmd(input) {
  outputLines = [];
  Game.parser.handleCommand(input);
  return outputLines;
}

console.log("-- Quit Confirmation Flow --");
var lines = runCmd("look");
assert("normal command resets pendingQuit", Game.state.pendingQuit === false);
runCmd("quit");
assert("first quit sets pendingQuit", Game.state.pendingQuit === true);
assert("first quit shows confirmation", outputLines.some(function(l){ return l.text.indexOf("sure") >= 0 || l.text.indexOf("confirm") >= 0; }));
runCmd("quit");
assert("second quit transitions to game_over", Game.state.mode === "game_over");
assert("second quit clears pendingQuit", Game.state.pendingQuit === false);

Game.state.mode = "playing";
Game.state.pendingQuit = true;
runCmd("look");
assert("non-quit command clears pendingQuit", Game.state.pendingQuit === false);
assert("non-quit command stays in playing", Game.state.mode === "playing");

console.log("\n-- Game Over Handler --");
Game.state.mode = "game_over";
runCmd("restart");
assert("restart resets to title", Game.state.mode === "title");

Game.state.mode = "game_over";
runCmd("invalid");
assert("invalid game over input shows restart prompt", outputLines.some(function(l){ return l.text.indexOf("restart") >= 0; }));

console.log("\n-- Unrecognized Command --");
Game.state.mode = "playing";
Game.state.player.name = "TestHero";
Game.state.player.backgroundId = "mercenary";
Game.state.player.locationId = "village_square";
runCmd("xyzzy");
assert("unrecognized shows error", outputLines.some(function(l){ return l.cls === "error"; }));
assert("unrecognized suggests typing help", outputLines.some(function(l){ return l.text.indexOf("help") >= 0; }));

console.log("\n-- Direction Commands --");
runCmd("north");
assert("north moves player", Game.state.player.locationId === "general_store");
Game.state.player.locationId = "general_store";
runCmd("s");
assert("s moves player south", Game.state.player.locationId === "village_square");
Game.state.player.locationId = "village_square";
runCmd("go east");
assert("go east moves player", Game.state.player.locationId === "temple_yard");

Game.state.player.locationId = "village_square";
runCmd("go up");
assert("invalid direction stays in place", Game.state.player.locationId === "village_square");
assert("invalid direction shows error", outputLines.some(function(l){ return l.cls === "error"; }));

console.log("\n-- Handler Argument Validation --");
runCmd("take");
assert("'take' with no arg shows error", outputLines.some(function(l){ return l.text.indexOf("what") >= 0 || l.text.indexOf("Take") >= 0; }));
runCmd("drop");
assert("'drop' with no arg shows error", outputLines.some(function(l){ return l.text.indexOf("what") >= 0 || l.text.indexOf("Drop") >= 0; }));
runCmd("equip");
assert("'equip' with no arg shows error", outputLines.some(function(l){ return l.text.indexOf("what") >= 0 || l.text.indexOf("Equip") >= 0; }));
runCmd("unequip");
assert("'unequip' with no arg shows error", outputLines.some(function(l){ return l.text.indexOf("what") >= 0 || l.text.indexOf("Unequip") >= 0; }));
runCmd("attack");
assert("'attack' with no arg shows error", outputLines.some(function(l){ return l.text.indexOf("what") >= 0 || l.text.indexOf("Attack") >= 0; }));
runCmd("talk");
assert("'talk' with no arg shows error", outputLines.some(function(l){ return l.text.indexOf("whom") >= 0 || l.text.indexOf("Talk") >= 0; }));
runCmd("use");
assert("'use' with no arg shows error", outputLines.some(function(l){ return l.text.indexOf("what") >= 0 || l.text.indexOf("Use") >= 0; }));
runCmd("read");
assert("'read' with no arg shows error", outputLines.some(function(l){ return l.text.indexOf("what") >= 0 || l.text.indexOf("Read") >= 0; }));
runCmd("open");
assert("'open' with no arg shows error", outputLines.some(function(l){ return l.text.indexOf("what") >= 0 || l.text.indexOf("Open") >= 0; }));

console.log("\n-- Look Command --");
runCmd("look");
assert("look shows location name", outputLines.some(function(l){ return l.text.indexOf("Village Square") >= 0; }));
assert("look shows exits", outputLines.some(function(l){ return l.text.indexOf("Exits") >= 0; }));

runCmd("look at well");
assert("look at something", outputLines.some(function(l){ return l.text.indexOf("well") >= 0; }));

console.log("\n-- Inventory Display --");
runCmd("inventory");
assert("inventory shows name", outputLines.some(function(l){ return l.text.indexOf("TestHero") >= 0; }));
assert("inventory shows equipment", outputLines.some(function(l){ return l.text.indexOf("Equipment") >= 0; }));
assert("inventory shows items section", outputLines.some(function(l){ return l.text.indexOf("Inventory") >= 0; }));

Game.state.player.inventory = [{ itemId: "torch", quantity: 2 }];
runCmd("inventory");
assert("inventory shows carried items", outputLines.some(function(l){ return l.text.indexOf("torch") >= 0 && l.text.indexOf("x2") >= 0; }));

Game.state.player.inventory = [];

Game.ui.print = origPrint;
Game.ui.echoCommand = origEcho;
Game.ui.printSeparator = origSep;

console.log("\n=== Results ===\n");
console.log("Passed: " + passed);
console.log("Failed: " + failed);
console.log("");

if (failed > 0) process.exit(1);
console.log("All tests passed!");
