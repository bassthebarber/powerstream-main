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

export default applyMetadata;
