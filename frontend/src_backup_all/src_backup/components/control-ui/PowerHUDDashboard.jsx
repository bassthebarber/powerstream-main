import React from 'react';
import MatrixOverride from '../Matrix/MatrixOverride';
import TriggerForceOverride from '../Copilot/core/TriggerForceOverride';
import DefenseHUD from '../SystemDefense/DefenseHUD';
import InfinityInitialize from '../Copilot/core/InfinityInitialize';

const PowerHUDDashboard = ({ command }) => {
  return (
    <div className="power-hud-dashboard">
      <h2>⚡ PowerStream HUD Panel</h2>
      <MatrixOverride command={command} />
      <TriggerForceOverride />
      <InfinityInitialize />
      <DefenseHUD />
    </div>
  );
};

export default PowerHUDDashboard;


