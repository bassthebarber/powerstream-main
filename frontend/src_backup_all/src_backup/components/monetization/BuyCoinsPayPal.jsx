import React from 'react';

const BuyCoinsPayPal = () => {
  return (
    <div className="buy-coins-container">
      <h2>Buy Coins with PayPal</h2>
      <button onClick={() => alert('Redirecting to PayPal...')}>Buy Now</button>
    </div>
  );
};

export default BuyCoinsPayPal;


