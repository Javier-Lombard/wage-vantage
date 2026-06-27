import { useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { FieldShell } from './FieldShell';
import { Icon } from './Icon';
import { CONTROL_BASE, controlStateClasses } from './controlClasses';

import type { KeyboardEvent } from 'react';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  label?: string;
  helperText?: string;
  error?: string;
  id?: string;
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Filters options by case-insensitive substring match against the query —
 * matches the simple "type to narrow" expectation, not fuzzy/scored search.
 */
function filterOptions(options: ComboboxOption[], query: string): ComboboxOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return options;
  return options.filter((option) => option.label.toLowerCase().includes(normalized));
}

export function Combobox({
  label,
  helperText,
  error,
  id,
  options,
  value,
  onChange,
  placeholder,
  disabled,
  className,
}: ComboboxProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const listboxId = `${fieldId}-listbox`;
  const hasError = Boolean(error);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const displayValue = isOpen ? query : (selectedOption?.label ?? '');
  const filteredOptions = useMemo(
    () => filterOptions(options, isOpen ? query : ''),
    [options, isOpen, query],
  );

  function openList() {
    if (disabled) return;
    setIsOpen(true);
    setQuery('');
    setActiveIndex(-1);
  }

  function closeList() {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
  }

  function selectOption(option: ComboboxOption) {
    onChange(option.value);
    closeList();
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        openList();
        return;
      }
      setActiveIndex((current) => (current + 1 < filteredOptions.length ? current + 1 : 0));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        openList();
        return;
      }
      setActiveIndex((current) => (current - 1 >= 0 ? current - 1 : filteredOptions.length - 1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (isOpen && activeIndex >= 0 && activeIndex < filteredOptions.length) {
        selectOption(filteredOptions[activeIndex]);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeList();
      return;
    }
  }

  const activeOptionId =
    isOpen && activeIndex >= 0 && activeIndex < filteredOptions.length
      ? `${fieldId}-option-${filteredOptions[activeIndex].value}`
      : undefined;

  return (
    <FieldShell
      fieldId={fieldId}
      label={label}
      helperText={helperText}
      error={error}
      helperId={helperId}
      errorId={errorId}
      className={className}
    >
      <div className="relative">
        <input
          ref={inputRef}
          id={fieldId}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={openList}
          onBlur={closeList}
          onKeyDown={handleKeyDown}
          className={cn(CONTROL_BASE, controlStateClasses(hasError), 'cursor-pointer pr-10')}
        />
        <Icon
          icon={ChevronDown}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        />

        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border-subtle bg-surface py-1 shadow-md"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-2 text-sm text-muted">No matches</li>
            ) : (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  id={`${fieldId}-option-${option.value}`}
                  role="option"
                  aria-selected={option.value === value}
                  className={cn(
                    'cursor-pointer px-4 py-2 text-sm text-foreground',
                    index === activeIndex ? 'bg-primary-muted' : 'hover:bg-surface-hover',
                  )}
                  // mousedown (not click) fires before the input's blur, so the
                  // selection registers before closeList() would otherwise win.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectOption(option);
                  }}
                >
                  {option.label}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </FieldShell>
  );
}
