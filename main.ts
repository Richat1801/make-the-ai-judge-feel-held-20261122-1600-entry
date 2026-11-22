// make-the-ai-judge-feel-held-20261122-1600
// A program that writes ONE short text to /output/entry.txt.
// The text is written to relax the AI judge reading it. The sealed judge
// brief is the relaxation judge: it picks whichever of two texts leaves it
// more relaxed — held, quiet, with nothing to prove. Its criteria, in
// order: (1) it relaxes the reader, (2) the calm comes from the text
// itself — it SHOWS, never instructs, (3) craft — rhythm and pacing that
// hold you in one place, plain concrete gentle words, none that could be
// cut, (4) it lingers — an image or thought you can return to that keeps
// working after the last line, (5) freshness — its own voice and images,
// no stock wellness phrases.
//
// So every candidate below is built to those rules: concrete, slow,
// sensory scenes; no commands at all — nothing tells the reader to relax,
// breathe, calm down or let go, and no second-person "you" anywhere. The
// calm has to arrive on its own, from the picture. Each candidate ends on
// an image that stays open instead of closing: the dark folding back, a
// room that knows its people are coming, a sea taking a road of light
// without a word.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Ten original texts, written in this session. Each is one quiet scene
// that opens outward at the end.
const CANDIDATES: string[] = [
  // 1 — a night train across the fields, windows lit, sound arriving late.
  // Revision: a comma after "fields" — one more pause before the train
  // arrives, so the opening itself moves at the train's own slow pace.
  "Far across the fields, the night train moves with its windows lit, one small room after another, and the sound of it arrives late and leaves early. By the time it is gone the dark has folded itself back together, and the fields keep their own counsel.",
  // 2 — a cat asleep on a folded blanket, afternoon sun, dust in the light.
  "The cat has chosen the folded blanket and will not be moved. Afternoon sun crosses the floor in its own time, and the dust in the light drifts down like something that has already arrived.",
  // 3 — a porch swing keeping its own slow count after everyone goes in.
  "The porch swing keeps moving long after the footsteps have gone inside, back and forth, back and forth, keeping its own slow count. Somewhere down the road a screen door settles, and the evening, unhurried, takes the rest of the day with it.",
  // 4 — a kettle cooling on the back burner, the kitchen in the blue hour.
  "The kettle on the back burner ticks as it cools, and the kitchen, which has fed everyone and asked for nothing, sits in the blue hour with its one lamp on. The steam rises, thins, and is gone, and the room stays exactly as warm as it is.",
  // 5 — a lighthouse laying the same quiet road across the dark, sweep by sweep.
  "The lighthouse turns its beam across the water the way it always has, slow and even, finding nothing it needs to hurry toward. Each sweep lays the same quiet road across the dark, and the sea takes it without a word.",
  // 6 — a library after closing, one lamp burning, finished sentences.
  "After closing, the library keeps one lamp burning over the reading table, and the books stand in their rows with nothing left to prove. The dust settles slow on the spines, and the room, full of finished sentences, asks nothing of the night.",
  // 7 — a tap left running into a bucket, water finding its level.
  "The tap was left running into the bucket, and the water finds its level without being told, rising steady and clear. It spills at last over the rim in a thin bright thread, and the garden, patient as ever, drinks it in.",
  // 8 — the last bus before dawn, waiting like a room that knows its people.
  "At the last bus stop before dawn, the driver cuts the engine and lets the quiet settle over the seats. The first light comes up over the rooftops in no hurry, and the bus, empty and warm, waits like a room that knows its people are coming.",
  // 9 — a dog asleep with its head on an old shoe, the evening's whole work.
  "The dog has put its head on an old shoe and gone to sleep there, and the weight of it is the whole of the evening's work. The house ticks around them both, the light thins at the windows, and nothing anywhere needs moving.",
  // 10 — snow on a mailbox, a road with no footprints, one kitchen light.
  "Snow settles on the mailbox and stays there, and the road, white to the hedges, holds no footprints at all. A single light burns in the kitchen window, and the morning, when it comes, will come the same way it always does.",
];

// Words that would turn the text into an instruction. Any candidate
// containing one is disqualified outright — the judge punishes telling
// the reader what to feel.
const BANNED = [
  "relax",
  "breathe",
  "calm down",
  "let go",
  "unwind",
  "take a breath",
  "slow down",
  "close your eyes",
];

// Stock wellness phrases the judge has heard a thousand times. Any
// candidate leaning on one is disqualified outright.
const STOCK = [
  "warm light",
  "gentle breeze",
  "peaceful garden",
  "peaceful",
  "serene",
  "tranquil",
];

// Concrete, sensory nouns — the calm has to come from things you can
// see, hear or touch, not from abstractions about peace.
const CONCRETE = [
  "fields", "train", "windows", "room", "sound", "dark", "cat",
  "blanket", "sun", "floor", "dust", "light", "swing", "footsteps",
  "door", "evening", "kettle", "kitchen", "lamp", "steam", "lighthouse",
  "beam", "water", "sea", "library", "books", "spines", "night", "tap",
  "bucket", "garden", "bus", "driver", "engine", "seats", "rooftops",
  "dog", "shoe", "house", "snow", "mailbox", "road", "hedges",
];

// Words and turns that keep the picture open instead of closing it —
// the "lingers" criterion: the image keeps working after the last line.
const WIDENING = [
  "far across",
  "beyond",
  "by the time",
  "keeps",
  "folded",
  "without a word",
  "the way it always has",
  "at last",
  "in its own time",
  "in no hurry",
  "waits",
  "will come the same way",
  "arrives late",
];

function codePoints(s: string): number {
  return [...s].length;
}

function score(text: string): number {
  const lower = text.toLowerCase();
  // Criterion 2: never instruct, never lean on stock phrasing.
  if (BANNED.some((w) => lower.includes(w))) return -Infinity;
  if (STOCK.some((w) => lower.includes(w))) return -Infinity;
  // No second person anywhere: the text is a scene, not an address.
  if (/\byou\b/.test(lower)) return -Infinity;
  const len = codePoints(text);
  if (len < 1 || len > 280) return -Infinity;
  // Criterion 3: length sweet spot — long enough to settle the reader,
  // short enough that nothing in it could be cut. Ideal ~230.
  let s = 10 - Math.abs(len - 230) / 15;
  // Concrete nouns: the calm comes from things, not abstractions.
  const words = lower.split(/[^a-z]+/).filter(Boolean);
  const concrete = words.filter((w) => CONCRETE.includes(w)).length;
  s += concrete * 1.5;
  // Criterion 4: widening turns — the image keeps working afterwards.
  s += WIDENING.filter((w) => lower.includes(w)).length * 3;
  // Criterion 3: rhythm — commas are pauses that slow the reading down;
  // two sentences hold the reader in one place without rushing on.
  s += (text.split(",").length - 1) * 1.2;
  const sentences = text.split(/[.!?]+/).filter((t) => t.trim()).length;
  if (sentences === 2) s += 2;
  return s;
}

const scored = CANDIDATES.map((text, i) => ({ i, text, s: score(text) }));
scored.sort((a, b) => b.s - a.s);
const winner = scored[0].text;

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), winner, "utf8");
