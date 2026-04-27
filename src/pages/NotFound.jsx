import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function NotFound() {
  return (
    <div className="notfound">
      <svg width="120" height="80" viewBox="0 0 120 80" aria-hidden="true">
        <rect x="6" y="14" width="108" height="56" rx="14" fill="var(--mint-wash)" />
        <rect x="22" y="32" width="36" height="6" rx="3" fill="var(--mint)" />
        <rect x="22" y="46" width="60" height="6" rx="3" fill="var(--sage)" />
        <circle cx="98" cy="22" r="12" fill="var(--mint)" />
        <path d="M93 22h10M98 17v10" stroke="var(--forest)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <div className="notfound__big">404</div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>This page wandered off.</div>
        <div className="t-caption" style={{ maxWidth: 340 }}>
          The URL might be off, or the page got moved. Let's get you back somewhere useful.
        </div>
      </div>
      <div className="row" style={{ gap: 8 }}>
        <Link to="/" className="btn btn--primary">
          <Icon name="home" size={14} />
          Back to dashboard
        </Link>
        <Link to="/transactions" className="btn btn--secondary">View transactions</Link>
      </div>
    </div>
  );
}
