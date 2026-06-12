import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  // Auth router
  auth: createRouter({
    me: authedQuery.query(({ ctx }) => {
      return {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        avatar: ctx.user.avatar,
        role: ctx.user.role,
      };
    }),

    logout: authedQuery.mutation(() => {
      return { success: true };
    }),
  }),

  // Admin router
  admin: createRouter({
    users: adminQuery.query(async () => {
      return [];
    }),
  }),
});

export type AppRouter = typeof appRouter;
