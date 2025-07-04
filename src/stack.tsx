import "server-only";

import { StackServerApp } from "@stackframe/stack";

// Check if Stack Auth environment variables are configured
const isStackConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
    process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
    process.env.STACK_SECRET_SERVER_KEY
  );
};

// Only create Stack Auth app if properly configured
export const stackServerApp = isStackConfigured()
  ? new StackServerApp({
    tokenStore: "nextjs-cookie",
  })
  : null;

// Helper function to check if Stack Auth is available
export const isStackAuthAvailable = () => {
  return isStackConfigured() && stackServerApp !== null;
};
