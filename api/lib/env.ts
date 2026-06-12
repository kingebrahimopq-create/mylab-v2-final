import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  appId: process.env.VITE_APP_ID || "",
  appSecret: process.env.APP_SECRET || "",
  appUrl: process.env.VITE_APP_URL || "http://localhost:3000",
  ownerUnionId: process.env.OWNER_UNION_ID || "",
  kimiAuthUrl: process.env.VITE_KIMI_AUTH_URL || "",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
};
