import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-6xl font-semibold mb-4">404</h1>
        <p className="mb-6 text-muted-foreground font-body">This page could not be found.</p>
        <Link to="/" className="text-primary underline font-body text-sm hover:text-primary/80 transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
