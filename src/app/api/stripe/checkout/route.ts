import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check if Stripe key exists
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY not found in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key', {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: NextRequest) {
  // Check if Stripe is properly configured
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_dummy_key') {
    return NextResponse.json({ 
      error: 'Stripe not configured. Please add your STRIPE_SECRET_KEY to .env.local' 
    }, { status: 500 });
  }

  try {
    const { invoiceId, amount, description } = await req.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Invoice #${invoiceId}`,
            description,
          },
          unit_amount: Math.round(amount * 100), // in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success&invoice=${invoiceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=cancelled&invoice=${invoiceId}`,
      metadata: {
        invoiceId,
      },
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (err: unknown) {
    console.error(err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 