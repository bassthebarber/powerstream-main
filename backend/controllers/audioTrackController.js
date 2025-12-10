import AudioTrack from '../models/AudioTrack.js';
import Recording from '../models/Recording.js';
import { ok, fail } from '../utils/response.js';

// ==========================================
// PUBLISH FROM STUDIO RECORDING
// ==========================================

export const publishFromRecording = async (req, res) => {
  try {
    const { recordingId, stationKey, title, artistName, releaseDate } = req.body;
    const userId = req.user?._id;

    if (!recordingId || !stationKey || !title || !artistName) {
      return res.status(400).json(
        fail('Missing required fields', 'MISSING_FIELDS')
      );
    }

    const recording = await Recording.findById(recordingId).lean();
    if (!recording) {
      return res
        .status(404)
        .json(fail('Recording not found', 'RECORDING_NOT_FOUND'));
    }

    const audioUrl =
      recording.masteredUrl || recording.cloudinaryUrl || recording.audioUrl;
    if (!audioUrl) {
      return res
        .status(400)
        .json(
          fail('Recording has no mastered or audio URL', 'NO_AUDIO_URL')
        );
    }

    const track = await AudioTrack.create({
      stationKey,
      title,
      artistName,
      releaseDate: releaseDate || new Date(),
      audioUrl,
      ownerUser: userId || null,
      duration: recording.duration || 0
    });

    return res.json(ok(track, 'Track published to station'));
  } catch (err) {
    console.error('publishFromRecording error:', err);
    return res
      .status(500)
      .json(fail('Internal server error', 'INTERNAL_ERROR'));
  }
};

// ==========================================
// CREATE DIRECT TRACK (Spotify-style upload)
// ==========================================

export const createDirectTrack = async (req, res) => {
  try {
    const {
      stationKey,
      title,
      artistName,
      albumName,
      genre,
      coverArtUrl,
      isExplicit,
      releaseDate,
      audioUrl,
      duration
    } = req.body;

    const ownerUser = req.user?._id || null;

    if (!stationKey || !title || !artistName || !audioUrl) {
      return res
        .status(400)
        .json(fail('stationKey, title, artistName, and audioUrl are required', 'MISSING_FIELDS'));
    }

    const track = await AudioTrack.create({
      stationKey,
      title,
      artistName,
      albumName,
      genre,
      coverArtUrl,
      isExplicit: !!isExplicit,
      releaseDate: releaseDate || new Date(),
      audioUrl,
      duration: duration || 0,
      ownerUser
    });

    return res.json(ok(track, 'Track created from direct upload'));
  } catch (err) {
    console.error('createDirectTrack error:', err);
    return res.status(500).json(fail('Internal server error', 'INTERNAL_ERROR'));
  }
};

// ==========================================
// LIST BY STATION
// ==========================================

export const listByStation = async (req, res) => {
  try {
    const { stationKey } = req.params;
    const { sort } = req.query;

    if (!stationKey) {
      return res
        .status(400)
        .json(fail('stationKey required', 'MISSING_STATION'));
    }

    let sortSpec = { releaseDate: -1, createdAt: -1 };
    if (sort === 'popular') {
      sortSpec = { playCount: -1, createdAt: -1 };
    }

    const tracks = await AudioTrack.find({
      stationKey,
      status: 'published'
    })
      .sort(sortSpec)
      .lean();

    return res.json(ok(tracks));
  } catch (err) {
    console.error('listByStation error:', err);
    return res
      .status(500)
      .json(fail('Internal server error', 'INTERNAL_ERROR'));
  }
};

// ==========================================
// LIST ALL TRACKS (Music Library)
// ==========================================

export const listAllTracks = async (req, res) => {
  try {
    const { sort, genre, artist, limit = 50, skip = 0 } = req.query;

    let query = { status: 'published' };
    if (genre) query.genre = genre;
    if (artist) query.artistName = { $regex: artist, $options: 'i' };

    let sortSpec = { createdAt: -1 };
    if (sort === 'popular') sortSpec = { playCount: -1, createdAt: -1 };
    if (sort === 'newest') sortSpec = { releaseDate: -1, createdAt: -1 };
    if (sort === 'artist') sortSpec = { artistName: 1, title: 1 };

    const tracks = await AudioTrack.find(query)
      .sort(sortSpec)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const total = await AudioTrack.countDocuments(query);

    return res.json(ok({ tracks, total, limit: parseInt(limit), skip: parseInt(skip) }));
  } catch (err) {
    console.error('listAllTracks error:', err);
    return res.status(500).json(fail('Internal server error', 'INTERNAL_ERROR'));
  }
};

// ==========================================
// GET MY TRACKS (User's uploads)
// ==========================================

export const getMyTracks = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json(fail('Not authenticated', 'UNAUTHORIZED'));
    }

    const tracks = await AudioTrack.find({ ownerUser: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(ok(tracks));
  } catch (err) {
    console.error('getMyTracks error:', err);
    return res.status(500).json(fail('Internal server error', 'INTERNAL_ERROR'));
  }
};

// ==========================================
// GET SINGLE TRACK
// ==========================================

export const getTrackById = async (req, res) => {
  try {
    const { id } = req.params;
    const track = await AudioTrack.findById(id).populate('ownerUser', 'username displayName avatar').lean();
    
    if (!track) {
      return res.status(404).json(fail('Track not found', 'NOT_FOUND'));
    }

    return res.json(ok(track));
  } catch (err) {
    console.error('getTrackById error:', err);
    return res.status(500).json(fail('Internal server error', 'INTERNAL_ERROR'));
  }
};

// ==========================================
// DELETE TRACK
// ==========================================

export const deleteTrack = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const track = await AudioTrack.findById(id);
    if (!track) {
      return res.status(404).json(fail('Track not found', 'NOT_FOUND'));
    }

    // Only owner can delete
    if (track.ownerUser?.toString() !== userId?.toString()) {
      return res.status(403).json(fail('Not authorized to delete this track', 'FORBIDDEN'));
    }

    await AudioTrack.findByIdAndDelete(id);
    return res.json(ok({ deleted: true }, 'Track deleted'));
  } catch (err) {
    console.error('deleteTrack error:', err);
    return res.status(500).json(fail('Internal server error', 'INTERNAL_ERROR'));
  }
};

// ==========================================
// GET UNIQUE ARTISTS
// ==========================================

export const getArtists = async (req, res) => {
  try {
    const artists = await AudioTrack.aggregate([
      { $match: { status: 'published' } },
      { $group: { 
        _id: '$artistName', 
        trackCount: { $sum: 1 },
        totalPlays: { $sum: '$playCount' },
        latestTrack: { $max: '$createdAt' }
      }},
      { $sort: { totalPlays: -1 } },
      { $limit: 100 }
    ]);

    return res.json(ok(artists));
  } catch (err) {
    console.error('getArtists error:', err);
    return res.status(500).json(fail('Internal server error', 'INTERNAL_ERROR'));
  }
};

// ==========================================
// REGISTER PLAY (monetization hook)
// ==========================================

export const registerPlay = async (req, res) => {
  try {
    const { id } = req.params;
    const { secondsPlayed } = req.body || {};

    const track = await AudioTrack.findById(id);
    if (!track) {
      return res
        .status(404)
        .json(fail('Track not found', 'TRACK_NOT_FOUND'));
    }

    track.playCount += 1;
    if (secondsPlayed && Number.isFinite(secondsPlayed)) {
      track.totalPlaySeconds += secondsPlayed;
    }
    await track.save();

    // TODO: hook into TokenLedger / monetization here

    return res.json(
      ok(
        {
          playCount: track.playCount,
          totalPlaySeconds: track.totalPlaySeconds
        },
        'Play registered'
      )
    );
  } catch (err) {
    console.error('registerPlay error:', err);
    return res
      .status(500)
      .json(fail('Internal server error', 'INTERNAL_ERROR'));
  }
};
