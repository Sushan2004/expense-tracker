import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="panel">
      <h2>404 - Page Not Found</h2>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link to="/" className="ghost-btn">
        Go to Dashboard
      </Link>
    </section>
  );
}
