// SmartRoyaltySplitter.js
const calculateSplit = (totalAmount, percentages) => {
  const splits = {};
  for (const key in percentages) {
    splits[key] = (totalAmount * (percentages[key] / 100)).toFixed(2);
  }
  return splits;
};

export default calculateSplit;
