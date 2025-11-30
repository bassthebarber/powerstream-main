import { Router } from "express";
const router = Router();
import tv from "../controllers/TVStationTheater.js";

router.get('/now/:stationId', tv.getNowPlaying);
router.get('/upcoming/:stationId', tv.getUpcomingShows);
router.get('/catalog/:stationId', tv.getMediaCatalog);

export default router;
