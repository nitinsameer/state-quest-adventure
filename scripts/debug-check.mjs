#!/usr/bin/env node
import fs from "fs";

const checkFile = "src/components/AllStatesSection.tsx";
const buf = fs.readFileSync(checkFile);

console.log("File:", checkFile);
console.log("Size:", buf.length);

// The patterns from check-encoding.mjs
const patterns = [
  [0xd0, 0x9f],
  [0xc2, 0xa0],
  [0xc2, 0xb7],
];

for (let pi = 0; pi < patterns.length; pi++) {
  const p = patterns[pi];
  console.log("Testing pattern", pi, ":", "0x" + p[0].toString(16), "0x" + p[1].toString(16));

  let found = 0;
  for (let i = 0; i < buf.length - 1; i++) {
    if (buf[i] === p[0] && buf[i + 1] === p[1]) {
      found++;
    }
  }
  console.log("  Found:", found);
}

// Test the second file
console.log("");
const checkFile2 = "src/components/ceremony/QuizCeremony.tsx";
const buf2 = fs.readFileSync(checkFile2);

console.log("File:", checkFile2);
console.log("Size:", buf2.length);

for (let pi = 0; pi < patterns.length; pi++) {
  const p = patterns[pi];
  let found = 0;
  for (let i = 0; i < buf2.length - 1; i++) {
    if (buf2[i] === p[0] && buf2[i + 1] === p[1]) {
      found++;
      if (found <= 2) {
        console.log("  Found pattern", pi, "at offset", i);
      }
    }
  }
  console.log("  Total:", found);
}
