import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import { kimiPlatform } from "./platform";
import { createSession, verifySession } from "./session";
import { env } from "../lib/env";
import { findUserByUnionId, createUser, updateUserLastSignIn } from "../queries/users";

const app = new Hono();

// OAuth callback handler
app.get("/api/oauth/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  if (!code) {
    return c.json({ error: "Missing authorization code" }, 400);
  }

  try {
    // Exchange code for token
    const tokenData = await kimiPlatform.exchangeCode(
      code,
      env.appId,
      env.appSecret,
      `${env.appUrl}/api/oauth/callback`
    );

    // Get user info
    const kimiUser = await kimiPlatform.getUserInfo(tokenData.access_token);

    // Find or create user
    let user = await findUserByUnionId(kimiUser.union_id);

    if (!user) {
      const isAdmin = kimiUser.union_id === env.ownerUnionId;
      const newUserId = await createUser({
        unionId: kimiUser.union_id,
        name: kimiUser.name || "User",
        email: kimiUser.email || null,
        avatar: kimiUser.avatar_url || null,
        role: isAdmin ? "admin" : "user",
      });
      user = await findUserByUnionId(kimiUser.union_id);
    } else {
      await updateUserLastSignIn(user.id);
    }

    if (!user) {
      return c.json({ error: "Failed to create or find user" }, 500);
    }

    // Create session
    const sessionToken = await createSession({
      userId: user.id,
      unionId: user.unionId,
      role: user.role,
    });

    // Set cookie
    setCookie(c, "session", sessionToken, {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });

    // Redirect to app
    const redirectTarget = state ? atob(state) : "/";
    return c.redirect(redirectTarget);
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    return c.json({ error: "Authentication failed" }, 500);
  }
});

// Logout handler
app.post("/api/oauth/logout", async (c) => {
  deleteCookie(c, "session", { path: "/" });
  return c.json({ success: true });
});

export default app;
