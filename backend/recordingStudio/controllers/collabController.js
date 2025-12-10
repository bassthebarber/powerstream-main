// controllers/collabController.js
import generateBeat from "../collabStudio/BeatGeneratorAI.js";
import saveVoiceRecording from "../collabStudio/VoiceRecorder.js";
import masterAudioTrack from "../collabStudio/AITrackMastering.js";
import uploadToPlatform from "../collabStudio/UploadToStream.js";
import handlePayment from "../collabStudio/TrackPaymentHandler.js";
import uploadCustomBeat from "../collabStudio/CustomBeatUploader.js";
import calculateSplit from "../collabStudio/SmartRoyaltySplitter.js";
import triggerSmartPay from "../collabStudio/SmartPayTrigger.js";
import enhanceVideoVisual from "../collabStudio/VideoVisualStudio.js";

export const generateBeatHandler = (req, res) => {
  const result = generateBeat(req.body.genre);
  res.json(result);
};

export const saveVoiceRecordingHandler = (req, res) => {
  const result = saveVoiceRecording(req.body.userId, req.body.audioBuffer);
  res.json({ status: "saved", file: result });
};

export const masterTrack = (req, res) => {
  const result = masterAudioTrack(req.body.rawTrackPath);
  res.json({ status: "mastered", finalTrackPath: result });
};

export const uploadToStream = (req, res) => {
  const result = uploadToPlatform(req.body.trackURL, req.body.artistId, req.body.title);
  res.json(result);
};

export const handlePaymentHandler = (req, res) => {
  const result = handlePayment(req.body.userId, req.body.beatId, req.body.price);
  res.json(result);
};

export const uploadCustomBeatHandler = (req, res) => {
  const result = uploadCustomBeat(req);
  res.json(result);
};

export const processRoyalty = (req, res) => {
  const { total, percentages } = req.body;
  const splits = calculateSplit(total, percentages);
  const payout = triggerSmartPay(splits, req.body.trackId);
  res.json(payout);
};

export const visualEnhance = (req, res) => {
  const enhancedPath = enhanceVideoVisual(req.body.videoPath);
  res.json({ status: "visual-enhanced", path: enhancedPath });
};

export default {
  generateBeat: generateBeatHandler,
  saveVoiceRecording: saveVoiceRecordingHandler,
  masterTrack,
  uploadToStream,
  handlePayment: handlePaymentHandler,
  uploadCustomBeat: uploadCustomBeatHandler,
  processRoyalty,
  visualEnhance,
};
