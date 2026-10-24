#!/usr/bin/env node
/**
 * Audio Content Verification Script
 *
 * Validates that all states' cards have required bilingual content.
 * For bilingual states: checks both English and native language content
 * For monolingual states: checks only English content
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration: bilingual states with their language codes
const BILINGUAL_STATES = {
  "Andhra Pradesh": "te",
  Gujarat: "gu",
  Karnataka: "kn",
  Maharashtra: "mr",
  "Tamil Nadu": "ta",
  "West Bengal": "bn",
  Rajasthan: "hi",
  "Madhya Pradesh": "hi",
  "Uttar Pradesh": "hi",
  Bihar: "hi",
  Jharkhand: "hi",
  Uttarakhand: "hi",
  Haryana: "hi",
  Delhi: "hi",
  "Andaman and Nicobar Islands": "hi",
  Odisha: "or",
  Kerala: "ml",
  Telangana: "te",
  Goa: "kok",
  Punjab: "pa",
  "Himachal Pradesh": "hi",
  Assam: "as",
  Manipur: "mni",
  Meghalaya: "kha",
  Mizoram: "miz",
  Chhattisgarh: "hne",
  "Jammu and Kashmir": "ur",
  Ladakh: "lbj",
  Sikkim: "ne",
  Tripura: "bn",
  Puducherry: "ta",
  Chandigarh: "pa",
  Lakshadweep: "ml",
  "Dadra and Nagar Haveli and Daman and Diu": "gu",
};

// Card types to verify
const CARD_TYPES = ["capital", "language", "food", "places", "animal", "funFact"];

// Required fields in each card's content
const REQUIRED_FIELDS = ["title", "emoji", "mainText", "narration"];

/**
 * Load states.json
 */
function loadStatesData() {
  const statesPath = path.join(__dirname, "../src/lib/content/states.json");
  const content = fs.readFileSync(statesPath, "utf-8");
  return JSON.parse(content);
}

/**
 * Check if card content has required fields
 */
function hasRequiredFields(cardContent) {
  return REQUIRED_FIELDS.every(
    (field) =>
      field in cardContent && cardContent[field] !== undefined && cardContent[field] !== null,
  );
}

/**
 * Verify a single state's content
 */
function verifyState(stateName, stateData) {
  const isBilingual = stateName in BILINGUAL_STATES;
  const nativeLanguageCode = BILINGUAL_STATES[stateName];
  const issues = [];

  for (const cardType of CARD_TYPES) {
    if (!(cardType in stateData)) {
      issues.push(`Missing card type: ${cardType}`);
      continue;
    }

    const cardData = stateData[cardType];

    if (isBilingual) {
      // For bilingual states, expect {en: {...}, langCode: {...}} structure
      if (!("en" in cardData)) {
        issues.push(`${cardType}: missing 'en' language variant`);
      } else if (!hasRequiredFields(cardData.en)) {
        const missing = REQUIRED_FIELDS.filter((f) => !(f in cardData.en)).join(", ");
        issues.push(`${cardType} (en): missing fields: ${missing}`);
      }

      if (!nativeLanguageCode) {
        issues.push(`${cardType}: no native language code configured`);
      } else if (!(nativeLanguageCode in cardData)) {
        issues.push(`${cardType}: missing '${nativeLanguageCode}' language variant`);
      } else if (!hasRequiredFields(cardData[nativeLanguageCode])) {
        const missing = REQUIRED_FIELDS.filter((f) => !(f in cardData[nativeLanguageCode])).join(
          ", ",
        );
        issues.push(`${cardType} (${nativeLanguageCode}): missing fields: ${missing}`);
      }
    } else {
      // For monolingual states, expect plain CardContent (not language variant structure)
      if (
        typeof cardData === "object" &&
        cardData !== null &&
        ("en" in cardData || nativeLanguageCode in cardData)
      ) {
        issues.push(`${cardType}: unexpected language variant structure for monolingual state`);
      } else if (!hasRequiredFields(cardData)) {
        const missing = REQUIRED_FIELDS.filter((f) => !(f in cardData)).join(", ");
        issues.push(`${cardType}: missing fields: ${missing}`);
      }
    }
  }

  return issues;
}

/**
 * Main verification
 */
function main() {
  console.log("\n🔍 Audio Content Verification\n");

  try {
    const statesData = loadStatesData();
    const results = [];
    let okCount = 0;
    let failCount = 0;

    for (const stateName of Object.keys(statesData.states)) {
      const stateData = statesData.states[stateName];
      const issues = verifyState(stateName, stateData);

      if (issues.length === 0) {
        results.push({ stateName, status: "✅ OK", issues: [] });
        okCount++;
      } else {
        results.push({ stateName, status: "❌ Issues", issues });
        failCount++;
      }
    }

    // Print table
    console.log("State Name                         | Status    | Issues");
    console.log("--".padEnd(70, "-"));

    for (const result of results) {
      const stateCol = result.stateName.padEnd(33);
      const statusCol = result.status.padEnd(11);
      if (result.issues.length === 0) {
        console.log(`${stateCol} | ${statusCol} |`);
      } else {
        console.log(`${stateCol} | ${statusCol} | ${result.issues[0]}`);
        for (let i = 1; i < result.issues.length; i++) {
          console.log(`${"".padEnd(33)} | ${"".padEnd(11)} | ${result.issues[i]}`);
        }
      }
    }

    // Summary
    console.log(`\n📊 Summary: ${okCount} states OK, ${failCount} states with gaps`);

    if (failCount > 0) {
      console.log("\n⚠️  Some states have missing content. Check above for details.\n");
      process.exit(1);
    } else {
      console.log("\n✨ All states have complete audio content!\n");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error during verification:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
