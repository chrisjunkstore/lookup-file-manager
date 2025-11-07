#!/usr/bin/env node

/**
 * Generate a large CSV test file approaching the 100MB limit
 * with maximum 128 fields per row
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TARGET_SIZE_MB = 95; // Stay under 100MB limit
const TARGET_SIZE_BYTES = TARGET_SIZE_MB * 1024 * 1024;
const MAX_FIELDS = 128;
const OUTPUT_FILE = path.join(__dirname, 'large-test-lookup.csv');

console.log('Generating large test file...');
console.log(`Target size: ${TARGET_SIZE_MB} MB`);
console.log(`Max fields: ${MAX_FIELDS}`);

// Create write stream
const writeStream = fs.createWriteStream(OUTPUT_FILE);

// Generate header row with 128 fields
const headers = [];
for (let i = 1; i <= MAX_FIELDS; i++) {
  headers.push(`field_${i}`);
}
writeStream.write(headers.join(',') + '\n');

// Generate data rows
let currentSize = Buffer.byteLength(headers.join(',') + '\n');
let rowCount = 0;

// Function to generate a random string of specified length
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate rows until we approach the target size
while (currentSize < TARGET_SIZE_BYTES) {
  const row = [];

  for (let i = 0; i < MAX_FIELDS; i++) {
    // Mix of different data types and lengths
    if (i % 10 === 0) {
      // Email-like field
      row.push(`user${rowCount}_${i}@example.com`);
    } else if (i % 7 === 0) {
      // Longer text field
      row.push(generateRandomString(20));
    } else if (i % 5 === 0) {
      // Number field
      row.push(Math.floor(Math.random() * 1000000).toString());
    } else if (i % 3 === 0) {
      // Date-like field
      row.push(`2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`);
    } else {
      // Regular text field
      row.push(generateRandomString(10));
    }
  }

  const rowString = row.join(',') + '\n';
  writeStream.write(rowString);

  currentSize += Buffer.byteLength(rowString);
  rowCount++;

  // Log progress every 1000 rows
  if (rowCount % 1000 === 0) {
    const currentMB = (currentSize / (1024 * 1024)).toFixed(2);
    console.log(`Generated ${rowCount} rows, current size: ${currentMB} MB`);
  }
}

writeStream.end();

writeStream.on('finish', () => {
  const finalSize = fs.statSync(OUTPUT_FILE).size;
  const finalSizeMB = (finalSize / (1024 * 1024)).toFixed(2);

  console.log('\n✅ File generation complete!');
  console.log(`Output file: ${OUTPUT_FILE}`);
  console.log(`Total rows: ${rowCount}`);
  console.log(`Total fields: ${MAX_FIELDS}`);
  console.log(`File size: ${finalSizeMB} MB`);
  console.log(`\nYou can now upload this file to test the app's limits.`);
});

writeStream.on('error', (err) => {
  console.error('Error generating file:', err);
  process.exit(1);
});