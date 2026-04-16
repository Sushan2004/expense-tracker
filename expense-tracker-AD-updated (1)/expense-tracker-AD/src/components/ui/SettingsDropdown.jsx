import PropTypes from "prop-types";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export default function SettingsDropdown({
  value,
  options,
  onSelect,
  renderTrigger,
  renderOption,
  listAriaLabel,
  searchable = false,
  searchLabel = "Search",
  searchPlaceholder = "Search...",
  getSearchText,
  disabled = false,
  isLoading = false,
  loadingMessage = "Loading...",
  emptyMessage = "No options available."
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const searchInputRef = useRef(null);
  const listId = useId();

  const selectedOption = useMemo(
    () => options.find((option) => String(option.value) === String(value)) || null,
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchable) {
      return options;
    }

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const haystack = typeof getSearchText === "function"
        ? getSearchText(option)
        : [option.label, option.meta, option.description].filter(Boolean).join(" ");

      return haystack.toLowerCase().includes(normalizedQuery);
    });
  }, [getSearchText, options, query, searchable]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery("");
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  async function handleSelect(nextValue) {
    setIsOpen(false);
    setQuery("");
    await onSelect(nextValue);
  }

  return (
    <div className="settings-dropdown" ref={rootRef}>
      <button
        type="button"
        className="settings-dropdown-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listId}
        disabled={disabled}
        onClick={() => {
          setIsOpen((current) => {
            const nextIsOpen = !current;

            if (!nextIsOpen) {
              setQuery("");
            }

            return nextIsOpen;
          });
        }}
      >
        {renderTrigger(selectedOption, isOpen)}
      </button>

      {isOpen ? (
        <div className="settings-dropdown-panel">
          {searchable ? (
            <label>
              {searchLabel}
              <input
                ref={searchInputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
              />
            </label>
          ) : null}

          {isLoading ? (
            <p className="muted">{loadingMessage}</p>
          ) : filteredOptions.length === 0 ? (
            <p className="muted">{emptyMessage}</p>
          ) : (
            <div className="settings-dropdown-list" id={listId} role="listbox" aria-label={listAriaLabel}>
              {filteredOptions.map((option) => {
                const isSelected = String(option.value) === String(value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`settings-dropdown-option ${isSelected ? "active" : ""}`}
                    aria-selected={isSelected}
                    onClick={() => {
                      void handleSelect(option.value);
                    }}
                  >
                    {renderOption(option, isSelected)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

SettingsDropdown.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  renderTrigger: PropTypes.func.isRequired,
  renderOption: PropTypes.func.isRequired,
  listAriaLabel: PropTypes.string.isRequired,
  searchable: PropTypes.bool,
  searchLabel: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  getSearchText: PropTypes.func,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  loadingMessage: PropTypes.string,
  emptyMessage: PropTypes.string
};
