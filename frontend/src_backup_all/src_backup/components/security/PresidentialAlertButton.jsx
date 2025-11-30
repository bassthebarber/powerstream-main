import React from 'react';

const PresidentialAlertButton = () => (
  <div className="presidential-alert">
    <button onClick={() => alert('🚨 NATIONAL OVERRIDE ACTIVATED')}>
      🔴 Presidential Override
    </button>
  </div>
);

export default PresidentialAlertButton;


