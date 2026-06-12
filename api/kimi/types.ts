export interface KimiUser {
  union_id: string;
  name: string;
  email?: string;
  avatar_url?: string;
}

export interface KimiTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

export interface KimiUserInfoResponse {
  union_id: string;
  name: string;
  email?: string;
  avatar_url?: string;
}
