import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_FILE = path.join(__dirname, '../.agent/SESSION_AUDIT.md');

function generateHash() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function startSession() {
  const hash = generateHash();
  const timestamp = new Date().toISOString();
  
  const entry = `\n## [${timestamp}] - Session Hash: **${hash}**\n- **Status**: ACTIVE\n- **Purpose**: Identity Verification & Persistence Check\n---\n`;

  try {
    if (!fs.existsSync(path.dirname(AUDIT_FILE))) {
      fs.mkdirSync(path.dirname(AUDIT_FILE), { recursive: true });
    }
    
    fs.appendFileSync(AUDIT_FILE, entry);
    console.log(`\n✅ Session Audit Recorded: ${hash}`);
    console.log(`\nQuote this hash in your next response to unlock the Safety Latch.\n`);
  } catch (err) {
    console.error('❌ Failed to record session audit:', err);
    process.exit(1);
  }
}

startSession();
