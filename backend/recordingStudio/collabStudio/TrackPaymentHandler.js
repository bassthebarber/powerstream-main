// TrackPaymentHandler.js
const handlePayment = (userId, beatId, price) => {
  return {
    status: "paid",
    message: `Beat ${beatId} purchased by ${userId} for $${price}`,
    downloadLink: `/beats/purchased/${beatId}.mp3`
  };
};

module.exports = handlePayment;
