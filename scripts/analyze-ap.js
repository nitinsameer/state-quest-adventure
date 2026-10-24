import fs from "fs";

const json = JSON.parse(fs.readFileSync("./src/lib/content/states.json", "utf8"));
const ap = json.states["Andhra Pradesh"];

console.log("\n=== ANDHRA PRADESH - CURRENT STRUCTURE ANALYSIS ===\n");

let totalCards = 0;
let totalContent = 0;

Object.entries(ap).forEach(([key, card]) => {
  if (typeof card === "object" && card.en && card.te) {
    totalCards++;
    console.log(`\n📌 ${key.toUpperCase()}`);
    console.log("   English Content:");
    console.log(`     - keyFacts: ${card.en.keyFacts?.length || 0} items`);
    console.log(`     - coolFacts: ${card.en.coolFacts?.length || 0} items`);
    console.log(`     - didYouKnow: ${card.en.didYouKnow ? "✓" : "✗"}`);
    console.log(`     - tryThis: ${card.en.tryThis ? "✓" : "✗"}`);

    const enCount =
      (card.en.keyFacts?.length || 0) +
      (card.en.coolFacts?.length || 0) +
      (card.en.didYouKnow ? 1 : 0) +
      (card.en.tryThis ? 1 : 0);
    const teCount =
      (card.te.keyFacts?.length || 0) +
      (card.te.coolFacts?.length || 0) +
      (card.te.didYouKnow ? 1 : 0) +
      (card.te.tryThis ? 1 : 0);

    console.log(`     📊 TOTAL: ${enCount} content pieces`);
    totalContent += enCount;
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total main cards: ${totalCards} (6 cards)`);
console.log(`Total content pieces: ${totalContent}`);
console.log(`Average per card: ${Math.round(totalContent / totalCards)} items`);
