import express from 'express';
import Stripe from 'stripe';
import User from '../models/user.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/stripe/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Buy PowerStream Coins' },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?canceled=true`,
      metadata: { userId },
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    res.status(500).json({ message: 'Stripe error' });
  }
});

// POST /api/stripe/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const amount = session.amount_total / 100;

    const user = await User.findById(userId);
    if (user) {
      user.coins += Number(amount);
      await user.save();
    }
  }

  res.json({ received: true });
});

export default router;
