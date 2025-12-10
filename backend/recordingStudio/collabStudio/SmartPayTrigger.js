// SmartPayTrigger.js
const triggerSmartPay = (splits, trackId) => {
  return {
    status: "initiated",
    trackId,
    payouts: splits,
    timestamp: Date.now()
  };
};

export default triggerSmartPay;
