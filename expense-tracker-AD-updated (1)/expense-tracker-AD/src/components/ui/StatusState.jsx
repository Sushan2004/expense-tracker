import PropTypes from "prop-types";

export default function StatusState({ type, title, description }) {
  return (
    <section className={`status-state ${type}`} aria-live="polite">
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}

StatusState.propTypes = {
  type: PropTypes.oneOf(["loading", "error", "empty"]).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};
