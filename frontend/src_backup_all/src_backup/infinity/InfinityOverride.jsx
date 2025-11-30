// frontend/src/infinity/InfinityOverride.jsx

import React from "react";

const InfinityOverride = ({ onOverride }) => {
  return (
    <div>
      <button onClick={onOverride} className="overrideBtn">
        Force System Override
      </button>
    </div>
  );
};

export default InfinityOverride;


