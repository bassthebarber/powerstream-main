#!/usr/bin/env bash
set -euo pipefail
API="http://127.0.0.1:5001/api/copilot/command"
HDR=(-H "Content-Type: application/json")

echo "▶ TV"
curl -sS -X POST "$API" "${HDR[@]}" --data-binary @- <<'JSON'
{ "command":"build tv",
  "context":{
    "network":"Southern Power Syndicate",
    "stations":["No Limit East Houston","Texas.Town","Pacific Connect"],
    "uploadsEnabled":true,
    "theme":{"name":"powerstream-dark","primary":"#d4af37","accent":"#d4af37","background":"#0a0a0a","logo":"/logos/powerstream-logo.png"},
    "splash":{"logo":"/logos/powerstream-logo.png","audio":"/audio/welcome-voice.mp3","size":300,"ms":3000,"clickToUnmute":true},
    "routes":{"autofix":true,"splitPages":true}
  } }
JSON
echo

echo "▶ PowerFeed"
curl -sS -X POST "$API" "${HDR[@]}" --data-binary @- <<'JSON'
{ "command":"build powerfeed",
  "context":{
    "ui":"facebook","page":"/feed",
    "logo":"/logos/powerfeedlogo.PNG",
    "routes":{"enforceSinglePageRender":true,"splitPages":true}
  } }
JSON
echo

echo "▶ PowerGram"
curl -sS -X POST "$API" "${HDR[@]}" --data-binary @- <<'JSON'
{ "command":"build powergram",
  "context":{
    "ui":"instagram-grid","page":"/gram",
    "logo":"/logos/PowerGramLogo.png",
    "grid":{"columns":3,"gap":8,"modal":true},
    "routes":{"enforceSinglePageRender":true,"splitPages":true}
  } }
JSON
echo

echo "▶ PowerReel"
curl -sS -X POST "$API" "${HDR[@]}" --data-binary @- <<'JSON'
{ "command":"build powerreel",
  "context":{
    "ui":"tiktok","page":"/reel",
    "logo":"/logos/PowerReelsLogo.png",
    "player":{"mutedOnStart":true,"unmuteOnTap":true,"loop":true},
    "routes":{"enforceSinglePageRender":true,"splitPages":true}
  } }
JSON
echo
echo "Done. Open:"
echo "  http://localhost:3000/feed"
echo "  http://localhost:3000/gram"
echo "  http://localhost:3000/reel"
echo "  http://localhost:3000/tv"
