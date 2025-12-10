// CustomBeatUploader.js
import fs from "fs";

const uploadCustomBeat = (req) => {
  const { artistId, projectName } = req.body;
  const filename = `${projectName}_${Date.now()}.mp3`;
  const path = `./beats/user/${artistId}/${filename}`;

  fs.copyFileSync(req.file.path, path);
  return {
    status: "success",
    beatPath: path
  };
};

export default uploadCustomBeat;
