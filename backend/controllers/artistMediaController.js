export const uploadArtistMedia = (req, res) => {
  try {
    const { artistId, mediaUrl, title } = req.body;
    // Save logic or DB call
    res.status(200).json({ message: "Artist media uploaded successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to upload media", error: error.message });
  }
};
