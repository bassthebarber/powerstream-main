import express from "express";
import ogs from "open-graph-scraper";
const app = express();

app.get("/api/og-preview", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "missing url" });
    const { result } = await ogs({ url });
    res.json({
      url,
      title: result.ogTitle || result.twitterTitle,
      desc: result.ogDescription || result.twitterDescription,
      image: (result.ogImage && result.ogImage[0]?.url) || result.twitterImage,
      site: result.ogSiteName
    });
  } catch (e) {
    res.json({ url: req.query.url });
  }
});

app.listen(5174, () => console.log("Server on 5174"));
