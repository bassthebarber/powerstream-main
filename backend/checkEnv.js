import fs from 'fs';
import path from 'path';

const envPath = path.resolve('./.env.local');
const exists = fs.existsSync(envPath);

console.log("✅ .env.local exists:", exists ? 'Yes' : 'No');
