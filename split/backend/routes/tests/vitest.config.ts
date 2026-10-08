import { defineConfig } from "vitest/config";
//npx vitest run
export default defineConfig({
  test: {
    environment: "node",
    // must be set before sources load; jwt/googleAuth fall back to hardcoded defaults
    env: {
      JWT_SECRET: "test-secret",
      JWT_EXPIRES_IN: "1h",
      GOOGLE_CLIENT_ID: "test-client-id",
      GOOGLE_CLIENT_SECRET: "test-client-secret",
      GOOGLE_REDIRECT_URI: "http://localhost:3000/api/auth/google/callback",
      FRONTEND_URL: "http://frontend.test",
    },
  },
});
