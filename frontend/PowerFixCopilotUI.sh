#!/bin/bash

echo "🚀 Running PowerStream Copilot UI Validator..."

# Step 1: Fix Supabase imports project-wide
find ./src -type f -name "*.js*" -exec sed -i '' 's|../supabaseClient|../../supabaseClient|g' {} +

# Step 2: Check if supabaseClient exists
if [ ! -f "./src/supabaseClient.js" ]; then
  echo "❌ Missing supabaseClient.js — creating fallback version..."
  echo "import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);" > ./src/supabaseClient.js
else
  echo "✅ supabaseClient.js found."
fi

# Step 3: Check for .env.local
if ! grep -q "VITE_SUPABASE_URL" .env.local; then
  echo "❌ .env.local missing Supabase keys. Please add:"
  echo "VITE_SUPABASE_URL=your-supabase-url"
  echo "VITE_SUPABASE_ANON_KEY=your-anon-key"
  exit 1
fi

# Step 4: Reset Cache and Reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Step 5: Start Dev Server with diagnostics
echo "✅ Starting PowerStream Dev Server with Copilot Diagnostic Mode..."
npm run dev
