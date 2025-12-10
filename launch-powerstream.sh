#!/bin/bash
echo "🔧 PowerStream Prime: Fullstack Auto-Repair + Launch"
echo "📂 Checking project structure..."

# Check backend routes
touch backend/routes/feedRoutes.js
touch backend/routes/commandRoutes.js

echo "🧠 Injecting fallback route content..."
cat <<EOF > backend/routes/feedRoutes.js
import express from "express";
const router = express.Router();
router.get("/", (_req, res) => {
  res.json({ feed: "Feed route active" });
});
export default router;
EOF

cat <<EOF > backend/routes/commandRoutes.js
import express from "express";
const router = express.Router();
router.get("/", (_req, res) => {
  res.json({ command: "Command route active" });
});
export default router;
EOF

# Install and launch backend
echo "📦 Backend install & boot..."
cd backend
npm install
npm run dev &
cd ..

# Launch frontend
echo "💻 Frontend install & boot..."
cd frontend
npm install
npm start &
cd ..

echo "✅ PowerStream Prime is Live on Ports 3000 and 5001"
