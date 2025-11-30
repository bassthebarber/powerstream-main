// /backend/copilot/intents.js

export function analyzeIntents(command = "") {
  const input = command.toLowerCase();

  if (input.includes("wake up")) return "wake_up";
  if (input.includes("put on a show")) return "start_show";
  if (input.includes("convince")) return "begin_speech";
  if (input.includes("show what we have")) return "demo_platform";
  if (input.includes("talk to the president")) return "presidential_statement";
  if (input.includes("upload a video")) return "trigger_upload_video";
  if (input.includes("build a page")) return "build_frontend_page";
  if (input.includes("create new section")) return "create_section";
  if (input.includes("display footage")) return "display_media";
  if (input.includes("override active")) return "activate_override";

  return "unknown";
}
