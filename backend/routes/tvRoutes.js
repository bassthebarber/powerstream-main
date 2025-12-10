// backend/routes/tvRoutes.js
// TV Station Routes - Complete API for stations and videos
import { Router } from 'express';
import mongoose from 'mongoose';
import Station from '../models/Station.js';
import Video from '../models/Video.js';
import { seedTVStations } from '../seeders/tvStationSeeder.js';

const router = Router();

// GET /api/tv/stations - List all active stations
router.get('/stations', async (req, res) => {
  try {
    const stations = await Station.find({ isPublic: { $ne: false } })
      .select('-videos')
      .sort({ name: 1 })
      .lean();
    
    return res.json({ ok: true, stations });
  } catch (err) {
    console.error('[TV] Error fetching stations:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// GET /api/tv/stations/:slug - Get station details
router.get('/stations/:slug', async (req, res) => {
  try {
    const station = await Station.findOne({ slug: req.params.slug }).lean();
    
    if (!station) {
      return res.status(404).json({
        ok: false,
        message: 'Station not found',
        slug: req.params.slug
      });
    }
    
    return res.json({ ok: true, station });
  } catch (err) {
    console.error('[TV] Error fetching station:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// GET /api/tv/stations/:slug/videos - Get station videos
// Returns ONLY MongoDB data - NO hardcoded arrays, NO seeds, NO placeholders
router.get('/stations/:slug/videos', async (req, res) => {
  try {
    const station = await Station.findOne({ slug: req.params.slug });
    
    if (!station) {
      return res.status(404).json({
        ok: false,
        message: 'Station not found',
        slug: req.params.slug
      });
    }
    
    // Log to confirm persistence
    console.log("Station videos:", station.videos);
    
    // Return videos directly from MongoDB - nothing else
    return res.json({ 
      ok: true, 
      videos: station.videos || [] 
    });
  } catch (err) {
    console.error('[TV] Video Load Error:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// POST /api/tv/stations/:slug/videos - Add video to station
router.post('/stations/:slug/videos', async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, url, thumbnail, durationSeconds } = req.body;
    const finalVideoUrl = videoUrl || url;
    const finalThumbnail = thumbnailUrl || thumbnail;
    
    if (!finalVideoUrl) {
      return res.status(400).json({ ok: false, message: 'videoUrl is required' });
    }
    
    // Find station (NOT lean, we need the Mongoose document)
    const station = await Station.findOne({ slug: req.params.slug });
    console.log('[TV] POST videos - station._id:', station?._id);
    if (!station) {
      return res.status(404).json({ ok: false, message: 'Station not found' });
    }
    
    const video = {
      title: title || 'Untitled Video',
      description: description || '',
      url: finalVideoUrl,
      videoUrl: finalVideoUrl, // backward compatibility
      thumbnail: finalThumbnail || '',
      thumbnailUrl: finalThumbnail || '', // backward compatibility
      uploadedAt: new Date()
    };
    
    // Initialize videos array if it doesn't exist
    if (!Array.isArray(station.videos)) {
      station.videos = [];
    }
    
    // Add video to beginning of array
    station.videos.unshift(video);
    
    // Mark videos as modified (important for embedded arrays)
    station.markModified('videos');
    
    // Save the station
    const savedStation = await station.save();
    
    console.log('[TV] Video saved. Total videos:', savedStation.videos.length);
    
    // Verify the save persisted
    const verification = await Station.findById(savedStation._id).lean();
    console.log('[TV] Verification - videos in DB:', verification?.videos?.length || 0);
    
    const savedVideo = station.videos[0];
    
    return res.status(201).json({
      ok: true,
      video: {
        _id: savedVideo._id,
        title: savedVideo.title,
        description: savedVideo.description,
        url: savedVideo.url || savedVideo.videoUrl,
        videoUrl: savedVideo.url || savedVideo.videoUrl, // backward compatibility
        thumbnail: savedVideo.thumbnail || savedVideo.thumbnailUrl,
        thumbnailUrl: savedVideo.thumbnail || savedVideo.thumbnailUrl, // backward compatibility
        uploadedAt: savedVideo.uploadedAt
      }
    });
  } catch (err) {
    console.error('[TV] Error adding video:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// POST /api/tv/seed - Seed default stations (NON-DESTRUCTIVE)
// This will NEVER delete stations or wipe videos
router.post('/seed', async (req, res) => {
  try {
    await seedTVStations();
    res.status(200).json({ ok: true, message: "TV stations seeded with persistence lock. No stations were deleted. No videos were touched." });
  } catch (err) {
    console.error('[TV SEED] Error:', err);
    res.status(500).json({ ok: false, message: "TV seed failed", error: err.message });
  }
});

// GET /api/tv/guide - Global TV Guide
router.get('/guide', async (req, res) => {
  try {
    const stations = await Station.find({ isPublic: { $ne: false } })
      .select('name slug logoUrl description isLive')
      .lean();
    
    return res.json({ ok: true, stations });
  } catch (err) {
    console.error('[TV] Guide error:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
});

// ============================================================
// UNIVERSAL STATION VIDEO CATALOG (supports stationId or slug)
// ============================================================

/**
 * GET /api/tv/:stationId/videos
 * Fetch all videos for a station (by ID or slug)
 */
router.get('/:stationId/videos', async (req, res) => {
  try {
    const { stationId } = req.params;
    
    // Build query - support both ObjectId and slug
    const isObjectId = mongoose.Types.ObjectId.isValid(stationId);
    const query = isObjectId 
      ? { $or: [{ _id: stationId }, { slug: stationId }] }
      : { slug: stationId };
    
    const station = await Station.findOne(query).lean();
    
    if (!station) {
      return res.status(404).json({
        success: false,
        ok: false,
        message: 'Station not found',
        stationId,
      });
    }
    
    // Get videos from station's embedded array
    let videos = station.videos || [];
    
    // Also check Video collection for additional videos
    const collectionVideos = await Video.find({ 
      $or: [
        { stationId: station._id },
        { stationSlug: station.slug }
      ]
    }).sort({ createdAt: -1 }).lean();
    
    // Merge if there are videos in the collection
    if (collectionVideos.length > 0) {
      videos = [...videos, ...collectionVideos];
    }
    
    res.json({ 
      success: true,
      ok: true,
      videos,
      count: videos.length,
      station: {
        _id: station._id,
        name: station.name,
        slug: station.slug,
        logo: station.logo || station.logoUrl,
      }
    });
  } catch (err) {
    console.error('[TV] Error fetching station videos:', err);
    res.status(500).json({ success: false, ok: false, error: err.message });
  }
});

/**
 * GET /api/tv/:stationId/catalog
 * Get full catalog info including station details and videos
 * Supports query params: search, category, sort, duration, limit, skip, featured
 */
router.get('/:stationId/catalog', async (req, res) => {
  try {
    const { stationId } = req.params;
    const { 
      search, 
      category, 
      sort = 'newest', 
      duration,
      limit = 100,
      skip = 0,
      featured,
    } = req.query;
    
    // Build query - support both ObjectId and slug
    const isObjectId = mongoose.Types.ObjectId.isValid(stationId);
    const query = isObjectId 
      ? { $or: [{ _id: stationId }, { slug: stationId }] }
      : { slug: stationId };
    
    const station = await Station.findOne(query).lean();
    
    if (!station) {
      return res.status(404).json({ 
        success: false,
        ok: false,
        message: 'Station not found',
        stationId,
      });
    }
    
    // Get videos from station's embedded array and Video collection
    let videos = station.videos || [];
    
    const collectionVideos = await Video.find({ 
      $or: [
        { stationId: station._id },
        { stationSlug: station.slug }
      ]
    }).sort({ createdAt: -1 }).lean();
    
    if (collectionVideos.length > 0) {
      videos = [...videos, ...collectionVideos];
    }
    
    // Apply filters
    
    // Featured filter
    if (featured === 'true') {
      videos = videos.filter(v => v.isFeatured);
      if (videos.length === 0) {
        // If no featured, return most recent
        videos = (station.videos || []).slice(0, 1);
      }
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      videos = videos.filter(v => 
        v.title?.toLowerCase().includes(searchLower) ||
        v.description?.toLowerCase().includes(searchLower) ||
        v.tags?.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    // Category filter
    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      videos = videos.filter(v => 
        v.category?.toLowerCase() === catLower ||
        v.tags?.some(t => t.toLowerCase() === catLower)
      );
    }
    
    // Duration filter
    if (duration && duration !== 'all') {
      const getDuration = (v) => v.duration || v.durationSeconds || 0;
      switch (duration) {
        case 'short':
          videos = videos.filter(v => getDuration(v) < 600);
          break;
        case 'medium':
          videos = videos.filter(v => getDuration(v) >= 600 && getDuration(v) <= 1800);
          break;
        case 'long':
          videos = videos.filter(v => getDuration(v) > 1800 && getDuration(v) <= 3600);
          break;
        case 'feature':
          videos = videos.filter(v => getDuration(v) > 3600);
          break;
      }
    }
    
    // Sort
    switch (sort) {
      case 'newest':
        videos.sort((a, b) => new Date(b.uploadedAt || b.createdAt) - new Date(a.uploadedAt || a.createdAt));
        break;
      case 'oldest':
        videos.sort((a, b) => new Date(a.uploadedAt || a.createdAt) - new Date(b.uploadedAt || b.createdAt));
        break;
      case 'popular':
        videos.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'title-asc':
        videos.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'title-desc':
        videos.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        break;
    }
    
    // Pagination
    const total = videos.length;
    videos = videos.slice(parseInt(skip), parseInt(skip) + parseInt(limit));
    
    res.json({
      success: true,
      ok: true,
      station: {
        _id: station._id,
        name: station.name,
        slug: station.slug,
        description: station.description,
        logo: station.logo || station.logoUrl,
        banner: station.banner || station.bannerUrl,
        category: station.category,
        isLive: station.isLive,
      },
      videos,
      count: videos.length,
      total,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + videos.length < total,
      }
    });
  } catch (err) {
    console.error('[TV] Error fetching catalog:', err);
    res.status(500).json({ success: false, ok: false, error: err.message });
  }
});

/**
 * POST /api/tv/videos/:id/engagement
 * Log video engagement (view, like, etc.)
 */
router.post('/videos/:id/engagement', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, stationId } = req.body;
    
    console.log(`[TV] Engagement: ${type} for video ${id}`);
    
    // Try to find video in Video collection
    let video = await Video.findById(id);
    
    if (video) {
      // Update engagement on Video document
      if (type === 'view') {
        video.views = (video.views || 0) + 1;
      } else if (type === 'like') {
        video.likes = (video.likes || 0) + 1;
      }
      await video.save();
      
      return res.json({ 
        success: true, 
        type, 
        views: video.views,
        likes: video.likes,
      });
    }
    
    // If not in Video collection, try Station's embedded videos
    if (stationId) {
      const station = await Station.findOne({
        $or: [
          { _id: stationId },
          { slug: stationId }
        ],
        'videos._id': id,
      });
      
      if (station) {
        const videoIndex = station.videos.findIndex(v => v._id?.toString() === id);
        if (videoIndex !== -1) {
          if (type === 'view') {
            station.videos[videoIndex].views = (station.videos[videoIndex].views || 0) + 1;
          } else if (type === 'like') {
            station.videos[videoIndex].likes = (station.videos[videoIndex].likes || 0) + 1;
          }
          station.markModified('videos');
          await station.save();
          
          return res.json({ 
            success: true, 
            type,
            views: station.videos[videoIndex].views,
            likes: station.videos[videoIndex].likes,
          });
        }
      }
    }
    
    // Video not found, but still acknowledge the engagement
    res.json({ success: true, type, message: 'Engagement logged' });
    
  } catch (err) {
    console.error('[TV] Engagement error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/tv/categories
 * Get list of all available categories across all stations
 */
router.get('/categories', async (req, res) => {
  try {
    // Get categories from Video collection
    const videoCategories = await Video.distinct('category');
    const videoTags = await Video.distinct('tags');
    
    // Get categories from Station videos
    const stations = await Station.find({}).select('videos.category videos.tags').lean();
    const stationCategories = new Set();
    const stationTags = new Set();
    
    stations.forEach(s => {
      (s.videos || []).forEach(v => {
        if (v.category) stationCategories.add(v.category);
        (v.tags || []).forEach(t => stationTags.add(t));
      });
    });
    
    // Combine and dedupe
    const allCategories = [
      ...new Set([
        ...videoCategories.filter(Boolean),
        ...Array.from(stationCategories),
      ])
    ].sort();
    
    const allTags = [
      ...new Set([
        ...videoTags.flat().filter(Boolean),
        ...Array.from(stationTags),
      ])
    ].sort();
    
    res.json({
      success: true,
      ok: true,
      categories: allCategories,
      tags: allTags,
    });
    
  } catch (err) {
    console.error('[TV] Categories error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
