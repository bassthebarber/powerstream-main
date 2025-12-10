import express from "express";
const router = Router();

let posts = [];
let grams = [{ id:1, imageUrl:"/sample/gram.jpg", caption:"Hello Gram" }];
let reels = [{ id:1, videoUrl:"/sample/reel-demo.mp4", title:"Demo Reel" }];

router.get("/posts", (_req,res)=> res.json(posts));
router.post("/posts", (req,res)=> {
  const { text, author } = req.body;
  const p = { id: Date.now(), text, author: author || "user" };
  posts.unshift(p);
  res.json(p);
});

router.get("/grams", (_req,res)=> res.json({ grams }));
router.get("/reels", (_req,res)=> res.json({ reels }));

export default router;
