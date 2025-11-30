// metadataManager.js
const applyMetadata = (filePath, metadata) => {
  return {
    file: filePath,
    metadata: {
      ...metadata,
      timestamp: Date.now()
    }
  };
};

module.exports = applyMetadata;
