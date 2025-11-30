// backend/controllers/feedController.js
export async function getFeed(req, res) {
  res.json({ ok: true, items: [] });
}

export async function createPost(req, res) {
  res.status(201).json({ ok: true });
}
