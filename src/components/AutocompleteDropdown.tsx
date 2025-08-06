import { useEffect, useRef } from "react";

interface Suggestion {
  text: string;
  type: "function" | "keyword" | "variable";
  description?: string;
}

interface AutocompleteDropdownProps {
  suggestions: Suggestion[];
  position: { x: number; y: number };
  onSelect: (suggestion: string) => void;
  onClose: () => void;
  selectedIndex: number;
}

export const AutocompleteDropdown = ({
  suggestions,
  position,
  onSelect,
  onClose,
  selectedIndex
}: AutocompleteDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (suggestions.length === 0) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case "function": return "ƒ";
      case "keyword": return "⚡";
      case "variable": return "x";
      default: return "•";
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case "function": return "text-blue-400";
      case "keyword": return "text-editor-tab-accent";
      case "variable": return "text-green-400";
      default: return "text-editor-text-dim";
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 bg-editor-panel border border-editor-border rounded-lg shadow-2xl min-w-[200px] max-w-[300px] animate-slide-down"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="py-1 max-h-48 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.text}-${index}`}
            className={`px-3 py-2 cursor-pointer transition-colors duration-150 flex items-center gap-2 ${
              index === selectedIndex
                ? "bg-control-hover text-editor-text"
                : "text-editor-text-dim hover:bg-control-bg hover:text-editor-text"
            }`}
            onClick={() => onSelect(suggestion.text)}
          >
            <span className={`text-xs font-bold w-4 text-center ${getColorForType(suggestion.type)}`}>
              {getIconForType(suggestion.type)}
            </span>
            <div className="flex-1">
              <div className="text-sm font-mono">{suggestion.text}</div>
              {suggestion.description && (
                <div className="text-xs text-editor-text-dim mt-0.5">
                  {suggestion.description}
                </div>
              )}
            </div>
            <span className="text-xs text-editor-text-dim capitalize">
              {suggestion.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};