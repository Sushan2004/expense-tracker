import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useSession } from '../state/SessionState.jsx';

const FEATURES = [
  {
    icon: 'list',
    title: 'Track every entry',
    body: 'Capture income, expenses, and recurring bills in one place without waiting for a bank sync.',
  },
  {
    icon: 'clock',
    title: 'Budgets that stay readable',
    body: 'Set category limits and spot what is healthy, close to the edge, or already over.',
  },
  {
    icon: 'bars',
    title: 'Reports with real context',
    body: 'Follow your spending patterns with clean breakdowns, money flow, and period-based reports.',
  },
  {
    icon: 'star',
    title: 'Savings with purpose',
    body: 'Move money toward goals and keep progress visible without cluttering the rest of the app.',
  },
  {
    icon: 'wallet',
    title: 'Manual first, sync later',
    body: 'Start with quick manual tracking now, then layer in bank sync when the app is ready for it.',
  },
  {
    icon: 'grid',
    title: 'Categories that fit you',
    body: 'Use the built-in categories or add custom ones with their own color and icon.',
  },
];

export default function Landing() {
  const { isAuthenticated } = useSession();

  return (
    <div className="landing-page">
      <div className="landing-page__bg" aria-hidden="true">
        <span className="landing-page__blob landing-page__blob--1" />
        <span className="landing-page__blob landing-page__blob--2" />
        <span className="landing-page__blob landing-page__blob--3" />
        <span className="landing-page__blob landing-page__blob--4" />
        <span className="landing-page__grid" />
      </div>

      <div className="landing-page__shell">
        <nav className="landing-nav">
          <div className="landing-nav__left">
            <Link to="/" className="landing-logo">
              <span className="landing-logo__mark" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M4 9.5 L7.5 13 L14.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="landing-logo__name">Expense Tracker</span>
            </Link>
            <div className="landing-nav__links">
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <a href="#pricing">Pricing</a>
            </div>
          </div>

          <div className="landing-nav__actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="landing-btn landing-btn--ghost">
                Open dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth?mode=login" className="landing-btn landing-btn--ghost">
                  Log in
                </Link>
                <Link to="/auth?mode=signup" className="landing-btn landing-btn--primary">
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </nav>

        <main>
          <section className="landing-hero">
            <div className="landing-hero__eyebrow">
              <span className="landing-hero__dot" />
              CSC 365 PROJECT
            </div>

            <h1 className="landing-hero__title">
              Your money,
              <br />
              <em>finally</em> makes sense.
            </h1>

            <p className="landing-hero__copy">
              Track expenses, income, budgets, and savings in a dashboard that explains your money clearly
              without feeling busy.
            </p>

            <div className="landing-hero__actions">
              <Link
                to={isAuthenticated ? '/dashboard' : '/auth?mode=signup'}
                className="landing-btn landing-btn--hero"
              >
                {isAuthenticated ? 'Go to dashboard' : 'Start tracking free'}
              </Link>
              <a href="#features" className="landing-btn landing-btn--outline">
                See how it works
              </a>
            </div>

            <div className="landing-preview">
              <div className="landing-preview__frame">
                <div className="landing-preview__bar">
                  <span className="landing-preview__dot landing-preview__dot--red" />
                  <span className="landing-preview__dot landing-preview__dot--amber" />
                  <span className="landing-preview__dot landing-preview__dot--green" />
                  <span className="landing-preview__url">expense-tracker.local/dashboard</span>
                </div>

                <div className="landing-preview__metrics">
                  <article className="landing-preview__metric">
                    <div className="landing-preview__label">Net cashflow</div>
                    <div className="landing-preview__value">$1,240</div>
                    <div className="landing-preview__meta">Income, spending, savings in one view</div>
                    <div className="landing-preview__track">
                      <span className="landing-preview__fill landing-preview__fill--emerald" style={{ width: '68%' }} />
                    </div>
                  </article>

                  <article className="landing-preview__metric">
                    <div className="landing-preview__label">Budget health</div>
                    <div className="landing-preview__value">$430 left</div>
                    <div className="landing-preview__meta">Category limits update as expenses arrive</div>
                    <div className="landing-preview__track">
                      <span className="landing-preview__fill landing-preview__fill--amber" style={{ width: '54%' }} />
                    </div>
                  </article>
                </div>

                <div className="landing-preview__categories">
                  {[
                    ['Food', '34%', 'var(--emerald-dark)'],
                    ['Transport', '22%', '#0EA5E9'],
                    ['Shopping', '61%', '#F59E0B'],
                    ['Home', '48%', '#6366F1'],
                  ].map(([name, percent, color]) => (
                    <div key={name} className="landing-preview__category">
                      <span className="landing-preview__category-name">{name}</span>
                      <span className="landing-preview__category-track">
                        <span className="landing-preview__category-fill" style={{ width: percent, background: color }} />
                      </span>
                      <span className="landing-preview__category-value">{percent}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="landing-section" id="features">
            <div className="landing-section__eyebrow">Features</div>
            <h2 className="landing-section__title">Designed to keep the important numbers readable.</h2>
            <p className="landing-section__copy">
              The app stays focused on what changed, what needs attention, and what is safe to ignore.
            </p>

            <div className="landing-features">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="landing-feature-card">
                  <span className="landing-feature-card__icon" aria-hidden="true">
                    <Icon name={feature.icon} size={20} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="landing-section landing-section--about" id="about">
            <div>
              <div className="landing-section__eyebrow">About</div>
              <h2 className="landing-section__title">This is the final project for CSC 365.</h2>
              <p className="landing-section__copy">
                Made by Ayush and Sushan.
              </p>
              <p className="landing-about__credit">
                Built for <span>fun</span> and the <span>learning process</span>.
              </p>
            </div>

            <div className="landing-about-card">
              <div className="landing-about-card__stats">
                <div className="landing-about-card__stat">
                  <div className="landing-about-card__label">Cashflow</div>
                  <div className="landing-about-card__value">$2,480</div>
                  <div className="landing-about-card__change landing-about-card__change--up">Income this month</div>
                </div>
                <div className="landing-about-card__stat">
                  <div className="landing-about-card__label">Spent</div>
                  <div className="landing-about-card__value">$1,240</div>
                  <div className="landing-about-card__change">Across your top categories</div>
                </div>
              </div>

              <div className="landing-about-card__chart" aria-hidden="true">
                {[40, 52, 28, 64, 76, 58, 88].map((height, index) => (
                  <span
                    key={height}
                    className={`landing-about-card__bar${index === 6 ? ' is-active' : ''}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="landing-cta-section" id="pricing">
            <div className="landing-cta">
              <div className="landing-cta__text">
                <h2>Start with the essentials, keep the insight.</h2>
                <p className="landing-cta__sub">FREE FOREVER</p>
              </div>

              <Link
                to={isAuthenticated ? '/dashboard' : '/auth?mode=signup'}
                className="landing-btn landing-btn--white"
              >
                {isAuthenticated ? 'Back to your dashboard' : 'Create your account'}
              </Link>
            </div>
          </section>
        </main>

        <footer className="landing-footer">
          <span>Expense Tracker</span>
          <div className="landing-footer__links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#pricing">Pricing</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
