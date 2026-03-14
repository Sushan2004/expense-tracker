import PropTypes from "prop-types";
import { buildCsv, downloadCsv } from "../../utils/helpers";

export default function ExportCsvButton({ transactions }) {
  return (
    <button
      type="button"
      className="ghost-btn"
      onClick={() => downloadCsv("transactions-export.csv", buildCsv(transactions))}
    >
      Export CSV
    </button>
  );
}

ExportCsvButton.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired
};
