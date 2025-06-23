import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with better error handling
const getStripeInstance = () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey || stripeKey === 'sk_test_dummy_key') {
    return null;
  }
  
  try {
    return new Stripe(stripeKey, {
      apiVersion: '2025-05-28.basil',
    });
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return null;
  }
};

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeInstance();
    
    if (!stripe) {
      return NextResponse.json({ 
        error: 'Payment processing not configured. Please contact support to enable payments.' 
      }, { status: 503 });
    }

    const { invoiceId, amount, description } = await req.json();

    // Validate required fields
    if (!invoiceId || !amount || amount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid payment details. Please check the invoice amount.' 
      }, { status: 400 });
    }

    // Ensure we have a valid base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    console.log('Creating Stripe session for invoice:', invoiceId, 'Amount:', amount);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Invoice #${invoiceId}`,
            description: description || `Payment for Invoice #${invoiceId}`,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/dashboard?payment=success&invoice=${invoiceId}`,
      cancel_url: `${baseUrl}/dashboard?payment=cancelled&invoice=${invoiceId}`,
      metadata: {
        invoiceId: invoiceId.toString(),
      },
    });

    if (!session.url) {
      throw new Error('Failed to generate payment URL');
    }

    console.log('Stripe session created successfully:', session.id);
    return NextResponse.json({ sessionUrl: session.url });

  } catch (err: unknown) {
    console.error('Stripe checkout error:', err);
    
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ 
        error: `Payment error: ${err.message}` 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Unable to process payment. Please try again or contact support.' 
    }, { status: 500 });
  }
} 