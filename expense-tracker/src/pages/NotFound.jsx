import { Link } from "react-router-dom";

// This page shows when URL doesn't match anything
// Route path="*" in App.jsx catches it

export default function NotFound() {
  return (
    <div className="glass not-found">
      <h1>404</h1>
      <p>Oops! This page does not exist.</p>
      {/* Link is like <a> but works with React Router */}
      <Link to="/">Go back home</Link>
    </div>
  );
}