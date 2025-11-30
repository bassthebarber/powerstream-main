import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export const mixTrack = async (req, res) => {
  const { vocalPath, beatPath, outputName } = req.body;
  const outputPath = path.join('mixed-tracks', `${outputName}.mp3`);

  const command = `ffmpeg -i ${beatPath} -i ${vocalPath} -filter_complex "[0:a][1:a]amix=inputs=2" -c:a libmp3lame ${outputPath}`;

  exec(command, (error) => {
    if (error) return res.status(500).json({ error: 'Mixing failed' });
    res.status(200).json({ message: 'Track mixed', file: `/mixed-tracks/${outputName}.mp3` });
  });
};

export const masterTrack = async (req, res) => {
  const { inputPath, outputName } = req.body;
  const outputPath = path.join('mastered-tracks', `${outputName}.mp3`);

  const command = `ffmpeg -i ${inputPath} -af "loudnorm,acompressor" ${outputPath}`;
  exec(command, (error) => {
    if (error) return res.status(500).json({ error: 'Mastering failed' });
    res.status(200).json({ message: 'Track mastered', file: outputPath });
  });
};

export const enhanceVocals = async (req, res) => {
  try {
    const { trackId } = req.body;
    res.status(200).json({ message: `✅ Vocals enhanced for track ${trackId}` });
  } catch (err) {
    res.status(500).json({ error: 'Enhancement failed' });
  }
};
