import PropTypes from "prop-types";

export default function Header({ title }) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Finance Overview</p>
        <h1>{title}</h1>
      </div>
    </header>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired
};
