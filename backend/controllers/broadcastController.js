// backend/controllers/broadcastController.js
// Broadcast Empire Pack - Controller for broadcast schedule management
import BroadcastEvent from '../models/BroadcastEvent.js';
import Station from '../models/Station.js';

/**
 * GET /api/broadcast/station/:slug/schedule
 * Get the broadcast schedule for a station
 */
export const getStationSchedule = async (req, res) => {
  try {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    // Find station by slug
    const station = await Station.findOne({ slug }).lean();
    if (!station) {
      return res.status(404).json({
        ok: false,
        message: 'Station not found',
        slug
      });
    }

    // Get scheduled events sorted by start time
    const events = await BroadcastEvent.find({ station: station._id })
      .sort({ startsAt: 1 })
      .limit(limit)
      .lean();

    return res.json({
      ok: true,
      station: {
        _id: station._id,
        name: station.name,
        slug: station.slug,
        logoUrl: station.logoUrl
      },
      events
    });
  } catch (err) {
    console.error('[Broadcast] getStationSchedule error:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * POST /api/broadcast/station/:slug/schedule
 * Create a new broadcast event for a station
 */
export const createBroadcastEvent = async (req, res) => {
  try {
    const { slug } = req.params;
    const { 
      title, 
      description, 
      type, 
      videoUrl, 
      thumbnailUrl, 
      startsAt, 
      endsAt, 
      isFeatured,
      metadata 
    } = req.body;

    // Validate required fields
    if (!title || !type || !videoUrl || !startsAt) {
      return res.status(400).json({
        ok: false,
        message: 'Missing required fields: title, type, videoUrl, startsAt'
      });
    }

    // Find station by slug
    const station = await Station.findOne({ slug });
    if (!station) {
      return res.status(404).json({
        ok: false,
        message: 'Station not found',
        slug
      });
    }

    // If this event should be featured, clear featured flag from other events
    if (isFeatured) {
      await BroadcastEvent.updateMany(
        { station: station._id, isFeatured: true },
        { $set: { isFeatured: false } }
      );
    }

    // Create the event
    const event = await BroadcastEvent.create({
      station: station._id,
      title,
      description: description || '',
      type,
      videoUrl,
      thumbnailUrl: thumbnailUrl || '',
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : undefined,
      isFeatured: isFeatured || false,
      metadata: metadata || {},
      createdBy: req.user?.email || req.user?._id || 'system'
    });

    console.log('[Broadcast] Created event:', event.title, 'for station:', station.name);

    return res.status(201).json({
      ok: true,
      event
    });
  } catch (err) {
    console.error('[Broadcast] createBroadcastEvent error:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * PATCH /api/broadcast/event/:id
 * Update a broadcast event
 */
export const updateBroadcastEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      type, 
      videoUrl, 
      thumbnailUrl, 
      startsAt, 
      endsAt, 
      isFeatured,
      status,
      metadata 
    } = req.body;

    // Find the event
    const event = await BroadcastEvent.findById(id);
    if (!event) {
      return res.status(404).json({
        ok: false,
        message: 'Broadcast event not found',
        id
      });
    }

    // If setting this as featured, clear featured from other events for this station
    if (isFeatured === true && !event.isFeatured) {
      await BroadcastEvent.updateMany(
        { station: event.station, isFeatured: true, _id: { $ne: id } },
        { $set: { isFeatured: false } }
      );
    }

    // Apply updates
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (type !== undefined) event.type = type;
    if (videoUrl !== undefined) event.videoUrl = videoUrl;
    if (thumbnailUrl !== undefined) event.thumbnailUrl = thumbnailUrl;
    if (startsAt !== undefined) event.startsAt = new Date(startsAt);
    if (endsAt !== undefined) event.endsAt = endsAt ? new Date(endsAt) : null;
    if (isFeatured !== undefined) event.isFeatured = isFeatured;
    if (status !== undefined) event.status = status;
    if (metadata !== undefined) event.metadata = metadata;

    await event.save();

    console.log('[Broadcast] Updated event:', event.title);

    return res.json({
      ok: true,
      event
    });
  } catch (err) {
    console.error('[Broadcast] updateBroadcastEvent error:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * DELETE /api/broadcast/event/:id
 * Delete a broadcast event
 */
export const deleteBroadcastEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await BroadcastEvent.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({
        ok: false,
        message: 'Broadcast event not found',
        id
      });
    }

    console.log('[Broadcast] Deleted event:', event.title);

    return res.json({
      ok: true,
      deleted: true
    });
  } catch (err) {
    console.error('[Broadcast] deleteBroadcastEvent error:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * GET /api/broadcast/station/:slug/live
 * Get the current live status for a station
 */
export const getLiveStatus = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find station by slug
    const station = await Station.findOne({ slug }).lean();
    if (!station) {
      return res.status(404).json({
        ok: false,
        message: 'Station not found',
        slug
      });
    }

    const now = new Date();

    // Find any event that qualifies as "live"
    // Priority: isLiveOverride > status === 'live' > currently in time range
    const liveEvent = await BroadcastEvent.findOne({
      station: station._id,
      $or: [
        { isLiveOverride: true },
        { status: 'live' },
        {
          startsAt: { $lte: now },
          $or: [
            { endsAt: { $exists: false } },
            { endsAt: null },
            { endsAt: { $gt: now } }
          ],
          status: { $ne: 'ended' }
        }
      ]
    })
    .sort({ isLiveOverride: -1, startsAt: -1 }) // Prefer live override
    .lean();

    return res.json({
      ok: true,
      station: {
        _id: station._id,
        name: station.name,
        slug: station.slug,
        logoUrl: station.logoUrl,
        isLive: station.isLive
      },
      liveEvent: liveEvent || null,
      isLive: !!liveEvent || station.isLive
    });
  } catch (err) {
    console.error('[Broadcast] getLiveStatus error:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
};

/**
 * POST /api/broadcast/station/:slug/live-override
 * Set or clear the live override for a station
 */
export const setLiveOverride = async (req, res) => {
  try {
    const { slug } = req.params;
    const { eventId, active } = req.body;

    // Find station by slug
    const station = await Station.findOne({ slug });
    if (!station) {
      return res.status(404).json({
        ok: false,
        message: 'Station not found',
        slug
      });
    }

    // If deactivating live override
    if (active === false) {
      await BroadcastEvent.updateMany(
        { station: station._id, isLiveOverride: true },
        { $set: { isLiveOverride: false, status: 'scheduled' } }
      );

      // Also update station's isLive flag
      station.isLive = false;
      await station.save();

      console.log('[Broadcast] Cleared live override for station:', station.name);

      return res.json({
        ok: true,
        isLive: false
      });
    }

    // If activating live override
    if (active === true) {
      if (!eventId) {
        return res.status(400).json({
          ok: false,
          message: 'eventId is required when activating live override'
        });
      }

      // Clear any existing live overrides for this station
      await BroadcastEvent.updateMany(
        { station: station._id, isLiveOverride: true },
        { $set: { isLiveOverride: false } }
      );

      // Set the new live override
      const event = await BroadcastEvent.findOneAndUpdate(
        { _id: eventId, station: station._id },
        { $set: { isLiveOverride: true, status: 'live' } },
        { new: true }
      );

      if (!event) {
        return res.status(404).json({
          ok: false,
          message: 'Event not found or does not belong to this station',
          eventId
        });
      }

      // Update station's isLive flag
      station.isLive = true;
      await station.save();

      console.log('[Broadcast] Set live override for station:', station.name, '| Event:', event.title);

      return res.json({
        ok: true,
        isLive: true,
        liveEvent: event
      });
    }

    return res.status(400).json({
      ok: false,
      message: 'active must be true or false'
    });
  } catch (err) {
    console.error('[Broadcast] setLiveOverride error:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
};


