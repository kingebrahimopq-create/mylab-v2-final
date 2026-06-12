import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { verifySession } from "./kimi/session";
import { findUserById } from "./queries/users";
import { getSessionToken } from "./lib/cookies";

export type User = {
  id: number;
  unionId: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: string;
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const token = getSessionToken(opts.req as any);
  
  if (!token) {
    return { req: opts.req, resHeaders: opts.resHeaders };
  }

  const session = await verifySession(token);
  if (!session) {
    return { req: opts.req, resHeaders: opts.resHeaders };
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return { req: opts.req, resHeaders: opts.resHeaders };
  }

  return {
    req: opts.req,
    resHeaders: opts.resHeaders,
    user: {
      id: user.id,
      unionId: user.unionId,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
  };
}
