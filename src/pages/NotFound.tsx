import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#002A54' }}>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: '#00A9E0' }}>404</h1>
        <p className="text-xl mb-8" style={{ color: '#A8D0E6' }}>Page not found</p>
        <Link to="/">
          <Button style={{ background: '#00A9E0', color: '#002A54' }}>
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
