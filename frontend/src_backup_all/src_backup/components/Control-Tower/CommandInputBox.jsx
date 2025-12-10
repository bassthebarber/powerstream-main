import React, { useState } from 'react';

const CommandInputBox = ({ onSubmit }) => {
  const [command, setCommand] = useState('');

  const handleSend = () => {
    if (command.trim()) {
      onSubmit(command);
      setCommand('');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={command}
        placeholder="Enter Command..."
        onChange={(e) => setCommand(e.target.value)}
      />
      <button onClick={handleSend}>Run</button>
    </div>
  );
};

export default CommandInputBox;


