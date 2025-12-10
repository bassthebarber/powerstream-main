import express from 'express';
const router = Router();

// Dummy ad data (replace this with real MongoDB logic later)
let ads = [
  {
    id: 1,
    title: 'PowerStream Launch Promo',
    imageUrl: 'https://example.com/ad1.jpg',
    link: 'https://powerstream.com/promo',
    active: true,
  },
  {
    id: 2,
    title: 'Subscribe Now and Get Coins!',
    imageUrl: 'https://example.com/ad2.jpg',
    link: 'https://powerstream.com/subscribe',
    active: true,
  },
];

// GET all ads
router.get('/', (req, res) => {
  res.json(ads);
});

// POST a new ad
router.post('/', (req, res) => {
  const { title, imageUrl, link, active } = req.body;
  const newAd = {
    id: ads.length + 1,
    title,
    imageUrl,
    link,
    active: active ?? true,
  };
  ads.push(newAd);
  res.status(201).json(newAd);
});

// DELETE ad by ID
router.delete('/:id', (req, res) => {
  const adId = parseInt(req.params.id);
  ads = ads.filter(ad => ad.id !== adId);
  res.json({ success: true, message: `Ad ${adId} removed.` });
});

export default router;
