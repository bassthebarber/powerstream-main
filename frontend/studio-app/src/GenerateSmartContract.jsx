import React, { useState } from 'react';
import axios from 'axios';

export default function GenerateSmartContract() {
  const [contractCode, setContractCode] = useState('');

  const generate = async () => {
    const res = await axios.post('/api/generate-contract', {
      artistAddress: "0xABC123...",
      platformAddress: "0xDEF456...",
      percentages: { artist: 50, platform: 50 },
    });

    setContractCode(res.data.contract);
  };

  return (
    <div>
      <button onClick={generate}>Generate Smart Contract</button>
      <pre>{contractCode}</pre>
    </div>
  );
}
