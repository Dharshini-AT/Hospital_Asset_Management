import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';

export default function SearchInputWithSuggestions({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Search...',
  suggestions = [],
  minChars = 2,
  className = '',
  inputClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const trimmed = value.trim();
  const shouldShow = isOpen && trimmed.length >= minChars && suggestions.length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!shouldShow) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (item) => {
    const textVal = typeof item === 'string' ? item : item.title || item.value || '';
    if (onChange) onChange(textVal);
    if (onSelect) onSelect(item);
    if (item.onSelect) item.onSelect();
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Highlight matching characters in suggestions
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const str = String(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = str.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <strong key={i} className="font-extrabold text-blue-600 bg-blue-50 px-0.5 rounded">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (trimmed.length >= minChars) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-xs text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 ${inputClassName}`}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Auto-Suggestion Dropdown Menu */}
      {shouldShow && (
        <div className="absolute left-0 top-full mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-[100] animate-scale-in">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Matching Suggestions ({suggestions.length})</span>
            <span className="text-[9px] font-normal text-slate-400 lowercase">click or press enter</span>
          </div>

          <div className="mt-1 max-h-72 overflow-y-auto space-y-1">
            {suggestions.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const title = typeof item === 'string' ? item : item.title;
              const subtitle = typeof item === 'object' ? item.subtitle : null;
              const badge = typeof item === 'object' ? item.badge : null;
              const Icon = typeof item === 'object' && item.icon ? item.icon : null;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition cursor-pointer ${
                    isSelected ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {Icon ? (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon size={14} />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                        <Search size={12} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {highlightMatch(title, trimmed)}
                      </p>
                      {subtitle && (
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {highlightMatch(subtitle, trimmed)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {badge && (
                      <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {highlightMatch(badge, trimmed)}
                      </span>
                    )}
                    <ChevronRight size={13} className="text-slate-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
