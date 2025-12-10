// frontend/src/copilot/control/AICommandRouter.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AICommandRouter = ({ command }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    switch (command.toLowerCase()) {
      case 'go to feed':
        navigate('/feed');
        break;
      case 'go to gram':
        navigate('/gram');
        break;
      case 'go to tv':
        navigate('/network');
        break;
      case 'launch autopilot':
        navigate('/copilot');
        break;
      default:
        console.log('Unknown command:', command);
    }
  }, [command, navigate]);

  return null;
};

export default AICommandRouter;


