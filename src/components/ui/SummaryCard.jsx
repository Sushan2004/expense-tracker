import PropTypes from "prop-types";

export default function SummaryCard({ label, value, tone = "default", hint }) {
  return (
    <article className={`summary-card ${tone}`}>
      <p>{label}</p>
      <h3>{value}</h3>
      {hint ? <small>{hint}</small> : null}
    </article>
  );
}

SummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(["default", "positive", "negative"]),
  hint: PropTypes.string
};

SummaryCard.defaultProps = {
  tone: "default",
  hint: ""
};
