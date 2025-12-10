Write-Host "🧠 Activating NeuralIntentMap Visual Engine..."

# Step 1: Install design dependencies
npm install @figma/plugin-typings --save-dev

# Step 2: Inject design intent maps
Copy-Item -Path "./design/kits/*.css" -Destination "./src/styles/"
Copy-Item -Path "./design/maps/*.jsx" -Destination "./src/ai/core/maps/"
Copy-Item -Path "./design/psd/*.psd" -Destination "./public/assets/"
Copy-Item -Path "./design/ai/*.ai" -Destination "./public/assets/"
Copy-Item -Path "./design/fig/*.fig" -Destination "./public/assets/"

# Step 3: Restart frontend with builder awareness
npm run dev

Write-Host "✅ NeuralIntentMap activated. Copilot can now read and build station UIs based on design intent."
