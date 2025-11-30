import { Router } from "express";
const router = Router();

let stations = [];

router.get('/', (req, res) => {
    res.json(stations);
});

router.post('/', (req, res) => {
    const { name, streamKey } = req.body;
    const newStation = { id: Date.now(), name, streamKey };
    stations.push(newStation);
    res.json(newStation);
});

export default router;
