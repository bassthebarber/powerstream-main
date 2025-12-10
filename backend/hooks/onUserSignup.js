// backend/hooks/onUserSignup.js
import sendReceiptEmail from "../utils/sendReceiptEmail.js";

export async function onUserSignup(user) {
  try {
    console.log(`🎉 User signed up: ${user.email}`);
    await sendReceiptEmail(user.email, 'Welcome to PowerStream!', 'Your account is now active.');
  } catch (err) {
    console.error('Signup hook error:', err);
  }
}

export default { onUserSignup };
