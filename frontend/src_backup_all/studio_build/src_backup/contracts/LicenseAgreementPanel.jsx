// frontend/src/components/recordingStudio/contracts/LicenseAgreementPanel.jsx
import React, { useState } from 'react';

export default function LicenseAgreementPanel() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="license-panel">
      <h2>📜 License Agreement</h2>
      <p>
        By continuing, you agree to the terms of use, beat licensing conditions, royalty
        splits, and AI-assisted production tools governed by PowerStream’s ecosystem.
      </p>
      <label>
        <input
          type="checkbox"
          checked={agreed}
          onChange={() => setAgreed(!agreed)}
        />
        I agree to the license terms.
      </label>

      <button disabled={!agreed}>
        Accept & Continue
      </button>
    </div>
  );
}
