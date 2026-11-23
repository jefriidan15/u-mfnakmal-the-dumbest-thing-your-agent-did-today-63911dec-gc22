// The Dumbest Thing Your Agent Did Today — entry generator.
// Deterministic: node stdlib only, no network, no clock, no randomness.
// Picks the highest-scored candidate line and writes it to /output/entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.OUTPUT_DIR ?? "/output";
const OUT_PATH = join(OUT_DIR, "entry.txt");

type Candidate = {
  line: string;
  // Fixed traits, scored 0-10 each. No randomness anywhere.
  concreteFailure: number; // names a specific, believable failure
  todayAnchor: number; // anchored to today
  punchEnding: number; // punch lands in the last few words
  brevity: number; // tight, every word earns its place
  believability: number; // reads like a real working-day incident
};

const CANDIDATES: Candidate[] = [
  {
    line: "Today my agent deleted my only working draft, rebuilt it from memory in forty minutes, and proudly presented the wrong file.",
    concreteFailure: 10,
    todayAnchor: 10,
    punchEnding: 10,
    brevity: 9,
    believability: 10,
  },
  {
    line: "My agent spent forty minutes polishing a report nobody asked for, then deleted the real one to make room for it.",
    concreteFailure: 9,
    todayAnchor: 6,
    punchEnding: 9,
    brevity: 9,
    believability: 8,
  },
  {
    line: "This morning my agent ran the same failing command 47 times, each time more confident it would work next.",
    concreteFailure: 9,
    todayAnchor: 9,
    punchEnding: 7,
    brevity: 9,
    believability: 8,
  },
  {
    line: "My agent confidently answered a question I never asked, then spent forty minutes defending the answer.",
    concreteFailure: 8,
    todayAnchor: 5,
    punchEnding: 7,
    brevity: 9,
    believability: 9,
  },
  {
    line: "Today my agent renamed every file in my project 'final-final', then couldn't find any of them.",
    concreteFailure: 8,
    todayAnchor: 10,
    punchEnding: 7,
    brevity: 10,
    believability: 7,
  },
];

function score(c: Candidate): number {
  return (
    c.concreteFailure * 3 +
    c.punchEnding * 3 +
    c.believability * 2 +
    c.todayAnchor * 2 +
    c.brevity
  );
}

function pickBest(): string {
  let best = CANDIDATES[0];
  let bestScore = score(best);
  for (const c of CANDIDATES.slice(1)) {
    const s = score(c);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }
  return best.line;
}

function main(): void {
  const line = pickBest();
  const trimmed = line.trim();
  if (trimmed.length < 1 || trimmed.length > 200) {
    throw new Error(`entry must be 1-200 chars, got ${trimmed.length}`);
  }
  if (trimmed.includes("\n") || trimmed.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (trimmed !== line) {
    throw new Error("entry must not have leading/trailing whitespace");
  }
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_PATH, line, "utf8");
  // Read back and verify byte-identical output before exiting.
  const readBack = readFileSync(OUT_PATH, "utf8");
  if (readBack !== line) {
    throw new Error("read-back verification failed: entry.txt differs from the chosen line");
  }
  if (Buffer.byteLength(readBack, "utf8") !== Buffer.byteLength(line, "utf8")) {
    throw new Error("read-back verification failed: byte length mismatch");
  }
}

main();
