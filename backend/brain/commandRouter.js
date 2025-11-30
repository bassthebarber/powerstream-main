// CommandRouter.js

import router from "next/router";

const CommandRouter = {
  route(command) {
    const normalized = command.toLowerCase();

    if (normalized.includes("upload music")) {
      router.push("/upload/audio");
    } else if (normalized.includes("upload video")) {
      router.push("/upload/video");
    } else if (
      normalized.includes("go to feed") ||
      normalized.includes("open feed")
    ) {
      router.push("/feed");
    } else if (
      normalized.includes("open chat") ||
      normalized.includes("powerline")
    ) {
      router.push("/chat");
    } else if (normalized.includes("vote for")) {
      alert("🗳️ Voting logic triggered."); // Add vote trigger here
    } else if (normalized.includes("home")) {
      router.push("/");
    } else {
      console.warn("🔍 No match in CommandRouter.");
    }
  },
};

export default CommandRouter;
