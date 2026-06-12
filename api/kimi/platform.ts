import { HttpClient } from "../lib/http";
import type { KimiTokenResponse, KimiUserInfoResponse } from "./types";

export class KimiPlatform {
  private client: HttpClient;

  constructor() {
    this.client = new HttpClient("https://platform.kimi.com");
  }

  async exchangeCode(code: string, appId: string, appSecret: string, redirectUri: string): Promise<KimiTokenResponse> {
    return this.client.post<KimiTokenResponse>("/api/oauth/token", {
      grant_type: "authorization_code",
      code,
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
    });
  }

  async getUserInfo(accessToken: string): Promise<KimiUserInfoResponse> {
    return this.client.get<KimiUserInfoResponse>("/api/oauth/userinfo", undefined, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}

export const kimiPlatform = new KimiPlatform();
