// backend/hooks/onUserSignup.js

const sendReceiptEmail = require('../utils/sendReceiptEmail');

exports.onUserSignup = async (user) => {
  try {
    console.log(`🎉 User signed up: ${user.email}`);
    await sendReceiptEmail(user.email, 'Welcome to PowerStream!', 'Your account is now active.');
  } catch (err) {
    console.error('Signup hook error:', err);
  }
};
