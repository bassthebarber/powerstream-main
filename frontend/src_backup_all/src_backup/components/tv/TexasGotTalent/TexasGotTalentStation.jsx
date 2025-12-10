import React from 'react';
import TGUpload from './TGUpload';
import TGTVGuide from './TGTVGuide';
import VotingPanel from './VotingPanel';
import './TexasGotTalentStation.css';

const TexasGotTalentStation = () => {
  return (
    <div className="tgt-station">
      <img
        src="/logos/texasgottalentlogo.png"
        alt="Texas Got Talent"
        className="station-logo"
      />
      <h2>Texas Got Talent</h2>

      <div className="tgt-sections">
        <TGUpload />
        <VotingPanel />
        <TGTVGuide />
      </div>
    </div>
  );
};

export default TexasGotTalentStation;
