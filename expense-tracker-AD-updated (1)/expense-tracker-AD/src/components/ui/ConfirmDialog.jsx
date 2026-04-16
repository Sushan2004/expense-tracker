import PropTypes from "prop-types";
import ModalDialog from "./ModalDialog";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm
}) {
  return (
    <ModalDialog isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="modal-copy">{message}</p>
      <div className="modal-actions">
        <button type="button" className="ghost-btn" onClick={onCancel} autoFocus>
          Cancel
        </button>
        <button type="button" className="ghost-btn danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </ModalDialog>
  );
}

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

ConfirmDialog.defaultProps = {
  confirmLabel: "Delete"
};
