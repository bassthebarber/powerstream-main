// src/ai/designPresets.js
export const designPresets = {
  facebook: {
    name: "Facebook",
    vars: {
      "--panel": "#111418",
      "--feed-width": "680px",
      "--rail-width": "320px",
      "--sidebar-width": "260px",
      "--gap": "18px",
    },
    classes: [
      "layout-facebook",
      "layout-sidebar-left",
      "layout-feed-center",
      "layout-right-rail",
      "show-stories",
      "density-comfortable",
    ],
  },
  instagram: {
    name: "Instagram",
    vars: {
      "--feed-width": "1000px",
      "--gap": "16px",
    },
    classes: ["layout-instagram", "layout-grid-media", "layout-no-right-rail"],
  },
  tiktok: {
    name: "TikTok",
    vars: { "--gap": "12px" },
    classes: ["layout-tiktok", "layout-vertical-reels", "layout-full-height"],
  },
};


