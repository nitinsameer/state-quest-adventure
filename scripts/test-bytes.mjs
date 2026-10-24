#!/usr/bin/env node
import fs from "fs";

const buf = fs.readFileSync("src/components/AllStatesSection.tsx");
console.log("Total bytes:", buf.length);
console.log("Testing pattern [0xd0, 0x9f]...");

let count = 0;
for (let i = 0; i < buf.length - 1; i++) {
  if (buf[i] === 0xd0 && buf[i + 1] === 0x9f) {
    count++;
    console.log("Found at offset", i, ":", buf[i].toString(16), buf[i + 1].toString(16));
  }
}
console.log("Total found:", count);

// Also test with Buffer.from
const pattern = Buffer.from([0xd0, 0x9f]);
const hasPattern = buf.includes(pattern);
console.log("Buffer.includes test:", hasPattern);

if (hasPattern) {
  const idx = buf.indexOf(pattern);
  console.log("First index:", idx);
  console.log("Context:", buf.slice(Math.max(0, idx - 10), idx + 20).toString("latin1"));
}
