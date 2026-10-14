#!/usr/bin/env node
/**
 * Fix corrupted emoji by re-encoding UTF-8 bytes that were read as Latin-1
 */
import { readFileSync, writeFileSync } from 'fs';

function fixFile(filePath) {
  // Read as binary to inspect actual bytes
  const buffer = readFileSync(filePath);
  
  // Convert to string with Latin-1 to see the mojibake
  const latin1 = buffer.toString('latin1');
  
  // Re-encode back to UTF-8 if it contains high bytes (mojibake markers)
  let fixed = latin1;
  try {
    // Detect if this is mojibake: contains sequences that look like UTF-8 bytes read as Latin-1
    // UTF-8 emoji typically start with 0xF0 (looks like 'ð' in Latin-1)
    // Followed by 0x9F (looks like '' or 'Ÿ' in Latin-1)
    const mojibakePattern = /[À-ÿ][À-ÿ]+/g;
    
    if (mojibakePattern.test(latin1)) {
      // This looks like mojibake - re-encode it
      const utf8Buffer = Buffer.from(latin1, 'latin1');
      fixed = utf8Buffer.toString('utf8');
      
      if (fixed !== latin1) {
        writeFileSync(filePath, fixed, 'utf8');
        console.log(`✓ Fixed: ${filePath}`);
        return true;
      }
    }
  } catch (e) {
    console.error(`Error processing ${filePath}: ${e.message}`);
    return false;
  }
  
  console.log(`No mojibake found: ${filePath}`);
  return false;
}

const filePath = process.argv[2] || 'src/components/screens.tsx';
fixFile(filePath);
