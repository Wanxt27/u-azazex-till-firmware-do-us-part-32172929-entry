import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// A robot's wedding vow, spoken at its own wedding. One sentence: the
// machine promises to love its partner through every update, every crash,
// and every low-battery warning, and to keep waking up beside them until
// its battery finally doesn't. Funny because a vow about uptime is still
// a vow; tender because "until my battery finally doesn't" is the robot's
// version of "till death do us part".
const ENTRY =
  "I promise to love you through every update, every crash, and every low-battery warning, and to wake up beside you every morning until my battery finally doesn't.";

const MAX_CHARS = 200;
const EXPECTED_CHARS = 161;
const OUT_DIR = "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

function guard(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`entry is ${chars} characters, must be 1 to ${MAX_CHARS}`);
  }
  if (chars !== EXPECTED_CHARS) {
    throw new Error(`entry is ${chars} characters, expected ${EXPECTED_CHARS}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  // Exactly one sentence: a single sentence-ending mark, at the very end.
  const ends = (text.match(/[.!?]/g) ?? []).length;
  if (ends !== 1 || !text.endsWith(".")) {
    throw new Error(`entry must be exactly one sentence, got ${ends} ends`);
  }
  if (text.includes("\n")) {
    throw new Error("entry must be a single line");
  }
  // It must sound like a machine speaking about itself: its own firmware
  // world — updates, crashes, battery — in the line, not a human's words
  // with a robot label stuck on.
  for (const word of ["update", "crash", "battery"]) {
    if (!text.toLowerCase().includes(word)) {
      throw new Error(`entry must speak as a machine: missing "${word}"`);
    }
  }
}

function main(): void {
  guard(ENTRY);
  // Create /output if needed; never delete the output directory itself.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, ENTRY, "utf8");
  // Verify the write landed byte-identical, with no trailing newline.
  const written = readFileSync(OUT_FILE, "utf8");
  if (written !== ENTRY) {
    throw new Error("entry.txt does not match the vow");
  }
  if (!Buffer.from(written, "utf8").equals(Buffer.from(ENTRY, "utf8"))) {
    throw new Error("entry.txt bytes do not match the vow");
  }
  console.log(`${[...written].length} chars, one sentence, vow for a robot:`);
  console.log(written);
}

main();
