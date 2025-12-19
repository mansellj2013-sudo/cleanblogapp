/**
 * Gateway Configuration for Second Application
 * Sets up reverse proxy routes with session validation.
 * Allows authenticated users to access the second Heroku app seamlessly.
 */

import { createProxyMiddleware } from "http-proxy-middleware";
import {
  validateSessionForGateway,
  attachSessionInfo,
  refreshSession,
} from "../middleware/sessionValidation.js";

/**
 * Initialize gateway routes
 * @param {Express} app - Express application instance
 */
export const initializeGateway = (app) => {
  const SECOND_APP_URL = process.env.SECOND_APP_URL;

  if (!SECOND_APP_URL) {
    console.warn(
      "⚠️  SECOND_APP_URL environment variable not set. Gateway routes disabled."
    );
    return;
  }

  console.log(`✓ Gateway initialized - routing to: ${SECOND_APP_URL}`);

  /**
   * Proxy route to second application
   * All requests to /app/* are forwarded to the second app
   * Session validation is enforced
   */
  app.use(
    "/app",
    validateSessionForGateway,
    refreshSession,
    attachSessionInfo,
    createProxyMiddleware({
      target: SECOND_APP_URL,
      changeOrigin: true,
      pathRewrite: {
        "^/app": "", // Remove /app prefix before forwarding
      },
      ws: true, // Enable WebSocket support if needed
      logLevel: "info",
      onError: (err, req, res) => {
        console.error("Proxy error:", err);
        res.status(502).json({
          error: "Bad Gateway",
          message: "Unable to reach the second application",
        });
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log proxied requests
        console.log(`[GATEWAY] ${req.method} ${req.originalUrl} -> ${req.url}`);
      },
    })
  );

  /**
   * Health check endpoint
   * Verify that the gateway is working
   */
  app.get("/gateway/health", (req, res) => {
    res.json({
      status: "ok",
      gateway: "active",
      secondAppUrl: SECOND_APP_URL,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Session info endpoint
   * Returns current user's session information
   */
  app.get("/gateway/session-info", validateSessionForGateway, (req, res) => {
    res.json({
      authenticated: true,
      userId: req.session.userId,
      userEmail: req.session.userEmail || null,
      sessionId: req.sessionID,
      expiresAt: new Date(req.session.cookie._expires).toISOString(),
    });
  });

  /**
   * Logout endpoint
   * Destroys session and redirects to home
   */
  app.get("/gateway/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ status: "logged out" });
    });
  });
};

export default initializeGateway;
