import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

// Initialize Stripe with better error handling
const getStripeInstance = () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey || stripeKey === 'sk_test_dummy_key' || stripeKey.length < 20) {
    console.log('Stripe webhook - payment processing not configured');
    return null;
  }
  
  try {
    return new Stripe(stripeKey, {
      apiVersion: '2025-05-28.basil',
    });
  } catch (error) {
    console.error('Failed to initialize Stripe for webhook:', error);
    return null;
  }
};

export async function POST(req: NextRequest) {
  const stripe = getStripeInstance();
  
  // Check if webhook is properly configured
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET === 'whsec_dummy_secret') {
    console.log('Stripe webhook not configured - returning success to avoid errors');
    return NextResponse.json({ 
      received: true,
      message: 'Webhook not configured - payment processing disabled'
    }, { status: 200 });
  }

  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoiceId;

    if (invoiceId) {
      try {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 'Paid' },
        });
        console.log(`Invoice ${invoiceId} marked as paid via webhook`);
      } catch (err) {
        console.error(`Failed to update invoice ${invoiceId}:`, err);
      }
    }
  }

  return NextResponse.json({ received: true });
} 