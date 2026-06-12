import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#002A54' }}>
      <Card className="w-full max-w-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <CardHeader className="text-center">
          <CardTitle style={{ color: '#F5F6F8' }}>Welcome to KW: Command</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            size="lg"
            style={{ background: '#00A9E0', color: '#002A54' }}
            onClick={() => {
              window.location.href = getOAuthUrl();
            }}
          >
            Sign in with Kimi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
