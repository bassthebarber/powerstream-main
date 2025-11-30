export const uploadAudio = async (req, res) => {
  try {
    const { title, artist } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Optional: Save file to AWS S3 or local disk here
    console.log('Audio received:', title, artist, file.originalname);

    res.status(200).json({ message: 'Audio uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};
