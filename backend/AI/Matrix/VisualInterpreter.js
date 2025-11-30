export const interpretVisuals = (command) => {
  console.log(`🎨 Interpreting visuals for action: ${command.action}`);

  switch (command.action) {
    case 'renderHome':
      return { component: 'HomepageView', theme: 'black-gold' };

    case 'renderTVGuide':
      return { component: 'TVGuide', theme: 'darkstream' };

    default:
      return { component: 'UnknownView', message: 'Unhandled command' };
  }
};
