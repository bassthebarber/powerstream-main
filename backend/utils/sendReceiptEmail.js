// /backend/utils/sendReceiptEmail.js

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail or SMTP user
    pass: process.env.EMAIL_PASS  // app password or SMTP pass
  }
});

export const sendReceiptEmail = async (to, coins, amount, method) => {
  const mailOptions = {
    from: `"PowerStream" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your PowerStream Coin Purchase Receipt',
    html: `
      <div style="font-family:sans-serif;padding:1rem">
        <h2>🪙 PowerStream Receipt</h2>
        <p>Thank you for purchasing <strong>${coins} Coins</strong>.</p>
        <ul>
          <li><strong>Payment Method:</strong> ${method}</li>
          <li><strong>Amount Paid:</strong> $${amount.toFixed(2)}</li>
          <li><strong>Coins Added:</strong> ${coins}</li>
        </ul>
        <p>If you have any questions, contact support.</p>
        <hr />
        <p style="font-size:0.9rem;color:gray;">This is an automated email from PowerStream.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};
