// backend/recordingStudio/controllers/voiceController.js
// AI Voice Clone Controller
// Handles voice profile creation, management, and synthesis
// SECURITY: All operations verify artist ownership

import VoiceProfile from '../models/VoiceProfile.js';
import LibraryItem from '../models/LibraryItem.js';
import Recording from '../models/Recording.js';
import voiceProvider from '../providers/voiceProvider.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output directory for synthesized vocals
const SYNTH_OUTPUT_DIR = process.env.VOICE_SYNTH_DIR || path.join(__dirname, '../output/voice-synth');
await fs.ensureDir(SYNTH_OUTPUT_DIR);

/**
 * Create a new voice profile
 * POST /api/studio/voice/create-profile
 */
export async function createProfile(req, res) {
  try {
    const { displayName, sampleIds, consent } = req.body;
    
    // Get artist ID from authenticated user
    const artistId = req.user?._id || req.body.artistId;
    
    if (!artistId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to create a voice profile.',
      });
    }
    
    // Validate consent
    if (!consent) {
      return res.status(400).json({
        success: false,
        error: 'Consent required',
        message: 'You must explicitly consent to voice cloning.',
      });
    }
    
    // Check if profile already exists
    const existingProfile = await VoiceProfile.findOne({ artistId });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: 'Profile exists',
        message: 'You already have a voice profile. Delete it first to create a new one.',
        existingProfile: existingProfile.toSafeJSON(),
      });
    }
    
    // Validate display name
    if (!displayName || displayName.length < 2 || displayName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid display name',
        message: 'Display name must be 2-100 characters.',
      });
    }
    
    // Validate sample IDs (3-10 required)
    if (!sampleIds || !Array.isArray(sampleIds) || sampleIds.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient samples',
        message: 'Please provide at least 3 voice samples for training.',
      });
    }
    
    if (sampleIds.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Too many samples',
        message: 'Maximum 10 voice samples allowed.',
      });
    }
    
    // Fetch and validate samples from Library/Recordings
    const trainingSamples = [];
    const audioFiles = [];
    
    for (const sampleId of sampleIds) {
      // Try Library first, then Recordings
      let sample = await LibraryItem.findOne({ 
        _id: sampleId,
        ownerUserId: artistId, // Security: Must own the sample
      });
      
      if (!sample) {
        sample = await Recording.findOne({
          _id: sampleId,
          ownerUserId: artistId,
        });
      }
      
      if (!sample) {
        return res.status(400).json({
          success: false,
          error: 'Sample not found',
          message: `Sample ${sampleId} not found or you don't own it.`,
        });
      }
      
      const fileUrl = sample.fileUrl || sample.audioUrl;
      const filePath = sample.localPath || sample.localFilePath;
      
      trainingSamples.push({
        libraryItemId: sample._id,
        fileUrl,
        duration: sample.duration || sample.durationSeconds,
        uploadedAt: new Date(),
        status: 'pending',
      });
      
      if (filePath && await fs.pathExists(filePath)) {
        audioFiles.push(filePath);
      } else if (fileUrl) {
        audioFiles.push(fileUrl);
      }
    }
    
    // Calculate total duration
    const totalDuration = trainingSamples.reduce((sum, s) => sum + (s.duration || 0), 0);
    
    // Create the voice profile
    const profile = new VoiceProfile({
      artistId,
      displayName,
      email: req.user?.email,
      provider: voiceProvider.getActiveProvider(),
      trainingSamples,
      totalTrainingDuration: totalDuration,
      status: 'pending',
      consentGiven: true,
      consentTimestamp: new Date(),
      consentIpAddress: req.ip || req.connection?.remoteAddress,
      createdBy: artistId,
    });
    
    await profile.save();
    
    // Start training in background
    setImmediate(async () => {
      try {
        // Update status to training
        await VoiceProfile.findByIdAndUpdate(profile._id, {
          status: 'training',
          trainingStartedAt: new Date(),
        });
        
        // Call provider to train
        const result = await voiceProvider.trainVoiceProfile({
          audioFiles,
          displayName,
          metadata: {
            artistId: artistId.toString(),
          },
        });
        
        // Update with result
        await VoiceProfile.findByIdAndUpdate(profile._id, {
          status: result.status === 'ready' ? 'ready' : 'training',
          providerModelId: result.providerModelId,
          statusMessage: result.message,
          trainingProgress: result.status === 'ready' ? 100 : 50,
          ...(result.status === 'ready' && { trainingCompletedAt: new Date() }),
        });
        
        console.log(`✅ [VoiceController] Training initiated for ${displayName}: ${result.providerModelId}`);
      } catch (err) {
        console.error(`❌ [VoiceController] Training failed:`, err.message);
        await VoiceProfile.findByIdAndUpdate(profile._id, {
          status: 'failed',
          statusMessage: err.message,
        });
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Voice profile created. Training has started.',
      profile: profile.toSafeJSON(),
    });
    
  } catch (err) {
    console.error('❌ [VoiceController] createProfile error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Get voice profile for an artist
 * GET /api/studio/voice/profile/:artistId
 */
export async function getProfile(req, res) {
  try {
    const { artistId } = req.params;
    const requestingUserId = req.user?._id || req.query.userId;
    
    // Security: User can only view their own profile
    if (!requestingUserId || artistId !== requestingUserId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only view your own voice profile.',
      });
    }
    
    const profile = await VoiceProfile.findOne({ artistId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'No voice profile found. Create one to get started.',
        hasProfile: false,
      });
    }
    
    res.json({
      success: true,
      hasProfile: true,
      profile: profile.toSafeJSON(),
    });
    
  } catch (err) {
    console.error('❌ [VoiceController] getProfile error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Get current user's voice profile
 * GET /api/studio/voice/my-profile
 */
export async function getMyProfile(req, res) {
  try {
    const artistId = req.user?._id || req.query.userId;
    
    if (!artistId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }
    
    const profile = await VoiceProfile.findOne({ artistId });
    
    if (!profile) {
      return res.json({
        success: true,
        hasProfile: false,
        profile: null,
        provider: voiceProvider.getActiveProvider(),
        capabilities: voiceProvider.getProviderCapabilities(voiceProvider.getActiveProvider()),
      });
    }
    
    res.json({
      success: true,
      hasProfile: true,
      profile: profile.toSafeJSON(),
      provider: profile.provider,
      capabilities: voiceProvider.getProviderCapabilities(profile.provider),
    });
    
  } catch (err) {
    console.error('❌ [VoiceController] getMyProfile error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Synthesize audio using artist's voice
 * POST /api/studio/voice/synthesize
 */
export async function synthesize(req, res) {
  try {
    const { mode, lyrics, referenceAudioId, tempo, key } = req.body;
    
    // Get artist ID from authenticated user
    const artistId = req.user?._id || req.body.artistId;
    
    if (!artistId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to synthesize audio.',
      });
    }
    
    // Fetch the artist's voice profile
    const profile = await VoiceProfile.findOne({ artistId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'No voice profile',
        message: 'You need to create a voice profile first.',
      });
    }
    
    // Check if profile is ready
    if (!profile.isReady()) {
      return res.status(400).json({
        success: false,
        error: 'Profile not ready',
        message: `Voice profile status: ${profile.status}. Please wait for training to complete.`,
        status: profile.status,
      });
    }
    
    // Check synthesis limits
    if (!profile.canSynthesize()) {
      return res.status(429).json({
        success: false,
        error: 'Limit exceeded',
        message: 'Daily synthesis limit reached. Try again tomorrow.',
        remaining: 0,
      });
    }
    
    // Validate mode
    if (!mode || !['lyrics', 'reference'].includes(mode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mode',
        message: 'Mode must be "lyrics" or "reference".',
      });
    }
    
    // Validate inputs based on mode
    if (mode === 'lyrics' && (!lyrics || lyrics.trim().length < 5)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid lyrics',
        message: 'Please provide at least 5 characters of lyrics.',
      });
    }
    
    let referenceUrl = null;
    if (mode === 'reference') {
      if (!referenceAudioId) {
        return res.status(400).json({
          success: false,
          error: 'Missing reference',
          message: 'Reference mode requires a referenceAudioId.',
        });
      }
      
      // Fetch reference audio (must be owned by artist)
      const refAudio = await LibraryItem.findOne({
        _id: referenceAudioId,
        ownerUserId: artistId,
      }) || await Recording.findOne({
        _id: referenceAudioId,
        ownerUserId: artistId,
      });
      
      if (!refAudio) {
        return res.status(400).json({
          success: false,
          error: 'Reference not found',
          message: 'Reference audio not found or you don\'t own it.',
        });
      }
      
      referenceUrl = refAudio.fileUrl || refAudio.audioUrl;
    }
    
    // Call provider to synthesize
    console.log(`🎤 [VoiceController] Synthesizing for ${profile.displayName}, mode: ${mode}`);
    
    const result = await voiceProvider.synthesizeVoice({
      providerModelId: profile.providerModelId,
      lyrics: mode === 'lyrics' ? lyrics : null,
      referenceUrl,
      provider: profile.provider,
      settings: profile.voiceSettings,
    });
    
    // Increment synthesis count
    await profile.incrementSynthesis();
    
    // Create library entry for the synthesized vocal
    const libraryItem = new LibraryItem({
      title: `AI Vocal - ${profile.displayName} - ${new Date().toLocaleDateString()}`,
      type: 'vocal',
      source: 'ai-generated',
      fileUrl: result.outputUrl,
      localPath: result.outputPath,
      duration: result.duration,
      artistName: profile.displayName,
      ownerUserId: artistId,
      bpm: tempo || null,
      key: key || null,
      status: 'ready',
      tags: ['ai-voice', 'synthesized', profile.displayName.toLowerCase()],
      description: mode === 'lyrics' 
        ? `Synthesized from lyrics: "${lyrics.substring(0, 100)}..."` 
        : 'Synthesized from reference audio',
    });
    
    await libraryItem.save();
    
    res.json({
      success: true,
      message: 'Audio synthesized successfully!',
      synthesis: {
        libraryItemId: libraryItem._id,
        fileUrl: result.outputUrl,
        duration: result.duration,
        mode,
        isStub: result.isStub || false,
      },
      profile: {
        remainingSyntheses: Math.max(0, profile.dailySynthesisLimit - profile.synthesisCount),
      },
    });
    
  } catch (err) {
    console.error('❌ [VoiceController] synthesize error:', err);
    res.status(500).json({
      success: false,
      error: 'Synthesis failed',
      message: err.message,
    });
  }
}

/**
 * Update voice profile settings
 * PATCH /api/studio/voice/settings
 */
export async function updateSettings(req, res) {
  try {
    const artistId = req.user?._id || req.body.artistId;
    const { voiceSettings, displayName } = req.body;
    
    if (!artistId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }
    
    const profile = await VoiceProfile.findOne({ artistId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'No voice profile found',
      });
    }
    
    // Update settings
    if (voiceSettings) {
      if (voiceSettings.stability !== undefined) {
        profile.voiceSettings.stability = Math.max(0, Math.min(1, voiceSettings.stability));
      }
      if (voiceSettings.clarity !== undefined) {
        profile.voiceSettings.clarity = Math.max(0, Math.min(1, voiceSettings.clarity));
      }
      if (voiceSettings.style !== undefined) {
        profile.voiceSettings.style = Math.max(0, Math.min(1, voiceSettings.style));
      }
      if (voiceSettings.speakerBoost !== undefined) {
        profile.voiceSettings.speakerBoost = Boolean(voiceSettings.speakerBoost);
      }
    }
    
    if (displayName && displayName.length >= 2 && displayName.length <= 100) {
      profile.displayName = displayName;
    }
    
    profile.lastModifiedBy = artistId;
    await profile.save();
    
    res.json({
      success: true,
      message: 'Settings updated',
      profile: profile.toSafeJSON(),
    });
    
  } catch (err) {
    console.error('❌ [VoiceController] updateSettings error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Delete voice profile
 * DELETE /api/studio/voice/profile
 */
export async function deleteProfile(req, res) {
  try {
    const artistId = req.user?._id || req.body.artistId;
    
    if (!artistId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }
    
    const profile = await VoiceProfile.findOne({ artistId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'No voice profile found',
      });
    }
    
    // Delete from provider
    if (profile.providerModelId) {
      try {
        await voiceProvider.deleteVoiceModel({
          providerModelId: profile.providerModelId,
          provider: profile.provider,
        });
      } catch (err) {
        console.warn('⚠️ [VoiceController] Provider deletion failed:', err.message);
      }
    }
    
    // Delete from database
    await VoiceProfile.findByIdAndDelete(profile._id);
    
    res.json({
      success: true,
      message: 'Voice profile deleted successfully.',
    });
    
  } catch (err) {
    console.error('❌ [VoiceController] deleteProfile error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Get training samples (Library items suitable for voice training)
 * GET /api/studio/voice/training-samples
 */
export async function getTrainingSamples(req, res) {
  try {
    const artistId = req.user?._id || req.query.userId;
    
    if (!artistId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }
    
    // Find vocals and recordings owned by the artist
    const [libraryItems, recordings] = await Promise.all([
      LibraryItem.find({
        ownerUserId: artistId,
        type: { $in: ['vocal', 'recording'] },
        status: 'ready',
      }).sort({ createdAt: -1 }).limit(50),
      Recording.find({
        ownerUserId: artistId,
        status: 'ready',
      }).sort({ createdAt: -1 }).limit(50),
    ]);
    
    const samples = [
      ...libraryItems.map(item => ({
        _id: item._id,
        title: item.title,
        type: item.type,
        duration: item.duration,
        source: 'library',
        createdAt: item.createdAt,
      })),
      ...recordings.map(rec => ({
        _id: rec._id,
        title: rec.title,
        type: 'recording',
        duration: rec.durationSeconds,
        source: 'recording',
        createdAt: rec.createdAt,
      })),
    ];
    
    // Sort by date
    samples.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      samples,
      count: samples.length,
    });
    
  } catch (err) {
    console.error('❌ [VoiceController] getTrainingSamples error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
    });
  }
}

/**
 * Health check
 */
export async function healthCheck(req, res) {
  res.json({
    success: true,
    service: 'Voice Clone API',
    provider: voiceProvider.getActiveProvider(),
    capabilities: voiceProvider.getProviderCapabilities(voiceProvider.getActiveProvider()),
    timestamp: new Date().toISOString(),
  });
}

export default {
  createProfile,
  getProfile,
  getMyProfile,
  synthesize,
  updateSettings,
  deleteProfile,
  getTrainingSamples,
  healthCheck,
};






