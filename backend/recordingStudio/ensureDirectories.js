// backend/recordingStudio/ensureDirectories.js
// Utility script to ensure all required directories exist

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define all required directories
const DIRECTORIES = [
  'output',
  'output/beats',
  'output/mixes',
  'output/masters',
  'output/recordings',
  'output/exports',
  'output/voice-synth',
  'temp',
  'uploads',
  'uploads/intake',
  'uploads/recordings',
  'uploads/beats',
  'uploads/samples',
  'ai/studio/jobs',
  'ai/studio/models',
  'ai/studio/uploads',
  'personas',
  'providers',
  'queues',
  'workers',
];

export async function ensureDirectories() {
  console.log('📁 Ensuring Recording Studio directories...');
  
  for (const dir of DIRECTORIES) {
    const fullPath = path.join(__dirname, dir);
    try {
      await fs.ensureDir(fullPath);
      console.log(`  ✓ ${dir}`);
    } catch (error) {
      console.error(`  ✗ ${dir}: ${error.message}`);
    }
  }
  
  console.log('✅ Directory structure ready');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureDirectories();
}

export default ensureDirectories;

