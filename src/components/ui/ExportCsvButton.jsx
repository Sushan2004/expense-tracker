import PropTypes from "prop-types";
import { buildCsv, downloadCsv } from "../../utils/helpers";

export default function ExportCsvButton({ transactions, filename, disabled, label }) {
  return (
    <button
      type="button"
      className="ghost-btn"
      disabled={disabled}
      onClick={() => downloadCsv(filename, buildCsv(transactions))}
    >
      {label}
    </button>
  );
}

ExportCsvButton.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
  filename: PropTypes.string,
  disabled: PropTypes.bool,
  label: PropTypes.string
};

ExportCsvButton.defaultProps = {
  filename: "transactions-export.csv",
  disabled: false,
  label: "Export CSV"
};
