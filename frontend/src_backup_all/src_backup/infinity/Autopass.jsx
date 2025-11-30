// frontend/src/infinity/Autopass.jsx

import React from "react";

const Autopass = ({ onPass }) => {
  return (
    <div>
      <h2>Infinity Autopass</h2>
      <button onClick={onPass}>Activate System Pass</button>
    </div>
  );
};

export default Autopass;


