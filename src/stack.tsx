import "server-only";

import { StackServerApp } from "@stackframe/stack";

// Check if Stack Auth environment variables are properly configured
const isStackAuthConfigured =
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID !== 'YOUR_NEON_AUTH_PROJECT_ID' &&
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY !== 'YOUR_NEON_AUTH_PUBLISHABLE_KEY' &&
  process.env.STACK_SECRET_SERVER_KEY &&
  process.env.STACK_SECRET_SERVER_KEY !== 'YOUR_NEON_AUTH_SECRET_KEY';

export const stackServerApp = isStackAuthConfigured
  ? new StackServerApp({
    tokenStore: "nextjs-cookie",
  })
  : null;

// Helper function to check if Stack Auth is available
export const isStackAuthAvailable = () => isStackAuthConfigured && stackServerApp !== null;
