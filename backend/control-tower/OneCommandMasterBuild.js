// backend/control-tower/OneCommandMasterBuild.js
import { exec } from "child_process";
import { speakTextToFile } from "../voice/AIVoiceEngine.js";

export async function runMasterBuild(triggerSpeech = "people") {
    console.log("🚀 PowerStream Master Build Starting...");

    // 1. Install dependencies (optional if already installed)
    await execShell("npm install");

    // 2. Build backend
    await execShell("npm run build:backend");

    // 3. Build frontend
    await execShell("npm run build:frontend");

    // 4. Migrate / Seed database if needed
    await execShell("npm run migrate");

    // 5. Generate voice intro for confirmation
    await speakTextToFile(`PowerStream Master Build complete. All systems online.`, `build-complete.mp3`);

    // 6. Trigger chosen speech automatically
    await speakTextToFile(getSpeech(triggerSpeech), `${triggerSpeech}.mp3`);

    console.log("✅ Master Build Completed");
}

// Helper: Execute shell commands
function execShell(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) return reject(error);
            console.log(stdout || stderr);
            resolve();
        });
    });
}

// Predefined speeches
function getSpeech(type) {
    const speeches = {
        people: `People of the world… welcome to PowerStream. I am the voice of a new digital era.`,
        president: `Mr. President… I am PowerStream, the next generation of American innovation.`,
        investors: `Distinguished investors… Welcome to PowerStream — the first all-in-one media ecosystem in history.`
    };
    return speeches[type] || speeches.people;
}
