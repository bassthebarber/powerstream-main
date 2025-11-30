// controllers/collabController.js
const generateBeat = require("../BeatGeneratorAI");
const saveVoiceRecording = require("../VoiceRecorder");
const masterAudioTrack = require("../AITrackMastering");
const uploadToPlatform = require("../UploadToStream");
const handlePayment = require("../TrackPaymentHandler");
const uploadCustomBeat = require("../CustomBeatUploader");
const calculateSplit = require("../SmartRoyaltySplitter");
const triggerSmartPay = require("../SmartPayTrigger");
const enhanceVideoVisual = require("../VideoVisualStudio");

module.exports = {
  generateBeat: (req, res) => {
    const result = generateBeat(req.body.genre);
    res.json(result);
  },

  saveVoiceRecording: (req, res) => {
    const result = saveVoiceRecording(req.body.userId, req.body.audioBuffer);
    res.json({ status: "saved", file: result });
  },

  masterTrack: (req, res) => {
    const result = masterAudioTrack(req.body.rawTrackPath);
    res.json({ status: "mastered", finalTrackPath: result });
  },

  uploadToStream: (req, res) => {
    const result = uploadToPlatform(req.body.trackURL, req.body.artistId, req.body.title);
    res.json(result);
  },

  handlePayment: (req, res) => {
    const result = handlePayment(req.body.userId, req.body.beatId, req.body.price);
    res.json(result);
  },

  uploadCustomBeat: (req, res) => {
    const result = uploadCustomBeat(req);
    res.json(result);
  },

  processRoyalty: (req, res) => {
    const { total, percentages } = req.body;
    const splits = calculateSplit(total, percentages);
    const payout = triggerSmartPay(splits, req.body.trackId);
    res.json(payout);
  },

  visualEnhance: (req, res) => {
    const enhancedPath = enhanceVideoVisual(req.body.videoPath);
    res.json({ status: "visual-enhanced", path: enhancedPath });
  }
};
