// backend/services/tvBuilder.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// resolve frontend root from backend/services/
const FRONTEND = path.resolve(__dirname, "../../frontend");

export async function ensureTVPage(ctx = {}) {
  const pageDir  = path.join(FRONTEND, "src", "pages");
  const pageFile = path.join(pageDir, "TV.jsx");

  const logo  = ctx.logo  || "/logos/powerstream-logo.png";
  const title = ctx.title || "PowerTV";

  const jsx = `import React from "react";

export default function TV(){
  return (
    <div style={{background:"#111",border:"1px solid #222",borderRadius:12,padding:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <img src="${logo}" width="28" height="28" alt="logo" />
        <h2 style={{margin:0,color:"#d4af37"}}>${title}</h2>
      </div>
      <p>Channel hub is online. Hook your player & station selector here.</p>
    </div>
  );
}
`;

  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(pageFile, jsx, "utf8");
  return { ok: true, file: pageFile };
}
