export const activateMatrixOverride = (command) => {
  console.log(`🛑 Matrix Override activated for command: ${command.action}`);

  switch (command.action) {
    case 'blackout':
      console.log('🕶️ Matrix blackout engaged — UI hidden.');
      break;

    default:
      console.log('🚨 No override logic matched.');
  }
};
