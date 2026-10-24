#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const flagged = [
  "src/components/AllStatesSection.tsx",
  "src/components/ceremony/QuizCeremony.tsx",
  "src/components/ParentZone.tsx",
  "src/components/PassportMightyTree.tsx",
  "src/components/PassportSapling.tsx",
  "src/components/PostcardFrame.tsx",
  "src/components/PostcardModal.tsx",
  "src/components/PostcardPreviewModal.tsx",
  "src/components/PostcardScreen.tsx",
  "src/components/screens.tsx",
  "src/components/UnlockCelebration.tsx",
  "src/lib/localStorage-schema.ts",
  "src/lib/postcard-library.ts",
  "src/lib/progress.ts",
  "src/lib/states.ts",
  "src/lib/__tests__/progress.test.ts",
];

for (const relPath of flagged) {
  const fullPath = path.join(projectRoot, relPath);
  if (fs.existsSync(fullPath)) {
    const buffer = fs.readFileSync(fullPath);
    fs.writeFileSync(fullPath, buffer, "utf8");
  }
}

console.log("Re-encoded " + flagged.length + " files");
