import React from 'react';

const BalanceDisplay = ({ balance }) => (
  <div className="balance-display">
    <h3>Your Balance:</h3>
    <p>${balance.toFixed(2)}</p>
  </div>
);

export default BalanceDisplay;


