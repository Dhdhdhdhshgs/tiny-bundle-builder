import { useState, useRef, useEffect } from "react";
import { X, Plus, Play, Settings, Minimize2, Maximize2, Save, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutocompleteDropdown } from "./AutocompleteDropdown";

interface Tab {
  id: string;
  name: string;
  content: string;
}

interface Suggestion {
  text: string;
  type: "function" | "keyword" | "variable";
  description?: string;
}

// Lua language definitions
const LUA_KEYWORDS = [
  { text: "print", type: "function" as const, description: "Prints values to console" },
  { text: "local", type: "keyword" as const, description: "Declares a local variable" },
  { text: "function", type: "keyword" as const, description: "Defines a function" },
  { text: "end", type: "keyword" as const, description: "Ends a block" },
  { text: "if", type: "keyword" as const, description: "Conditional statement" },
  { text: "then", type: "keyword" as const, description: "Part of if statement" },
  { text: "else", type: "keyword" as const, description: "Alternative condition" },
  { text: "elseif", type: "keyword" as const, description: "Additional condition" },
  { text: "for", type: "keyword" as const, description: "Loop statement" },
  { text: "while", type: "keyword" as const, description: "While loop" },
  { text: "do", type: "keyword" as const, description: "Start of loop body" },
  { text: "repeat", type: "keyword" as const, description: "Repeat-until loop" },
  { text: "until", type: "keyword" as const, description: "End condition for repeat" },
  { text: "return", type: "keyword" as const, description: "Returns value from function" },
  { text: "break", type: "keyword" as const, description: "Breaks out of loop" },
  { text: "true", type: "keyword" as const, description: "Boolean true value" },
  { text: "false", type: "keyword" as const, description: "Boolean false value" },
  { text: "nil", type: "keyword" as const, description: "Null value" },
  { text: "and", type: "keyword" as const, description: "Logical AND operator" },
  { text: "or", type: "keyword" as const, description: "Logical OR operator" },
  { text: "not", type: "keyword" as const, description: "Logical NOT operator" },
  { text: "type", type: "function" as const, description: "Returns type of value" },
  { text: "tostring", type: "function" as const, description: "Converts value to string" },
  { text: "tonumber", type: "function" as const, description: "Converts value to number" },
  { text: "pairs", type: "function" as const, description: "Iterator for tables" },
  { text: "ipairs", type: "function" as const, description: "Iterator for arrays" },
  { text: "table.insert", type: "function" as const, description: "Inserts element into table" },
  { text: "table.remove", type: "function" as const, description: "Removes element from table" },
  { text: "string.len", type: "function" as const, description: "Returns string length" },
  { text: "string.sub", type: "function" as const, description: "Returns substring" },
  { text: "math.abs", type: "function" as const, description: "Absolute value" },
  { text: "math.floor", type: "function" as const, description: "Rounds down" },
  { text: "math.ceil", type: "function" as const, description: "Rounds up" },
  { text: "math.random", type: "function" as const, description: "Random number" }
];

export const CodeEditor = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "1", name: "Untitled 1", content: "-- Start coding in Lua...\n\n" }
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [consoleOutput, setConsoleOutput] = useState("Console Output\n");
  const [isMinimized, setIsMinimized] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ x: 0, y: 0 });
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [definedVariables, setDefinedVariables] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Extract defined variables from code
  const extractVariables = (code: string): string[] => {
    const localMatches = code.match(/local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
    const functionMatches = code.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
    
    const variables = [
      ...localMatches.map(match => match.replace("local ", "")),
      ...functionMatches.map(match => match.replace("function ", ""))
    ];
    
    return [...new Set(variables)]; // Remove duplicates
  };

  // Get autocomplete suggestions
  const getSuggestions = (input: string, variables: string[]): Suggestion[] => {
    if (input.length < 1) return [];
    
    const variableSuggestions = variables
      .filter(variable => variable.toLowerCase().startsWith(input.toLowerCase()))
      .map(variable => ({
        text: variable,
        type: "variable" as const,
        description: "User defined variable"
      }));

    const keywordSuggestions = LUA_KEYWORDS
      .filter(keyword => keyword.text.toLowerCase().startsWith(input.toLowerCase()));

    return [...keywordSuggestions, ...variableSuggestions].slice(0, 8);
  };

  // Handle cursor position for autocomplete positioning
  const getCursorPosition = () => {
    if (!textareaRef.current) return { x: 0, y: 0 };
    
    const textarea = textareaRef.current;
    const rect = textarea.getBoundingClientRect();
    const style = window.getComputedStyle(textarea);
    const fontSize = parseInt(style.fontSize);
    const lineHeight = parseInt(style.lineHeight) || fontSize * 1.2;
    
    const content = textarea.value.substring(0, textarea.selectionStart);
    const lines = content.split('\n');
    const currentLineIndex = lines.length - 1;
    const currentColumnIndex = lines[lines.length - 1].length;
    
    const x = rect.left + currentColumnIndex * (fontSize * 0.6) + 24; // Approximate character width
    const y = rect.top + (currentLineIndex + 1) * lineHeight + 24;
    
    return { x, y };
  };

  const addTab = () => {
    const newId = Date.now().toString();
    const newTab = {
      id: newId,
      name: `Untitled ${tabs.length + 1}`,
      content: "-- New Lua file...\n\n"
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newId);
  };

  const closeTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab(newTabs[0].id);
    }
  };

  const runCode = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab) {
      setConsoleOutput(prev => prev + `\n> Running ${currentTab.name}...\n> Lua code executed successfully!\n> Output: Hello from Lua!`);
    }
  };

  const updateContent = (content: string) => {
    setTabs(tabs.map(tab => 
      tab.id === activeTab ? { ...tab, content } : tab
    ));
    
    // Extract variables from updated content
    const variables = extractVariables(content);
    setDefinedVariables(variables);
    
    // Show typing animation
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 150);
  };

  // Handle autocomplete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSuggestionSelect(suggestions[selectedSuggestionIndex].text);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    updateContent(value);
    setCursorPosition(cursorPos);
    
    // Get current word being typed
    const beforeCursor = value.substring(0, cursorPos);
    const words = beforeCursor.split(/[\s\n\t\(\)\[\]\{\}\.,:;]/);
    const currentWord = words[words.length - 1];
    
    if (currentWord.length > 0) {
      const newSuggestions = getSuggestions(currentWord, definedVariables);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedSuggestionIndex(0);
      
      if (newSuggestions.length > 0) {
        const position = getCursorPosition();
        setSuggestionPosition(position);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const value = textarea.value;
    const cursorPos = textarea.selectionStart;
    
    // Get current word to replace
    const beforeCursor = value.substring(0, cursorPos);
    const words = beforeCursor.split(/[\s\n\t\(\)\[\]\{\}\.,:;]/);
    const currentWord = words[words.length - 1];
    
    const newValue = value.substring(0, cursorPos - currentWord.length) + 
                    suggestion + 
                    value.substring(cursorPos);
    
    updateContent(newValue);
    setShowSuggestions(false);
    
    // Set cursor position after the inserted suggestion
    setTimeout(() => {
      const newCursorPos = cursorPos - currentWord.length + suggestion.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-editor-panel border border-editor-border rounded-lg p-3 shadow-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(false)}
          className="text-editor-text hover:bg-control-hover font-medium"
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          Oppenheimer Executor
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto h-screen bg-editor-bg border border-editor-border rounded-lg overflow-hidden flex flex-col shadow-2xl">
      {/* Title Bar */}
      <div className="flex items-center justify-between bg-editor-panel border-b border-editor-border px-4 py-3">
        <h1 className="text-editor-text font-medium text-sm tracking-wide">Oppenheimer Executor</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={runCode}
            className="text-editor-tab-accent hover:bg-control-hover h-7 px-3 text-xs font-medium"
          >
            <Play className="h-3 w-3 mr-1" />
            Run
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-editor-text-dim hover:bg-control-hover h-7 px-3 text-xs"
          >
            <Settings className="h-3 w-3 mr-1" />
            Settings
          </Button>
          <div className="w-px h-4 bg-editor-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-editor-text-dim hover:bg-control-hover h-6 w-6 p-0"
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-editor-text-dim hover:bg-control-hover h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center bg-editor-panel">
        <div className="flex items-center rounded-t-lg overflow-hidden">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`relative flex items-center gap-2 px-4 py-2 text-sm cursor-pointer transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-editor-tab-active text-editor-text border-t-2 border-editor-tab-accent"
                  : "text-editor-text-dim hover:bg-control-hover"
              } ${index === 0 ? 'rounded-tl-lg' : ''} ${index === tabs.length - 1 ? 'rounded-tr-lg' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
              {tabs.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="h-4 w-4 p-0 hover:bg-control-hover ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={addTab}
          className="text-editor-text-dim hover:bg-control-hover h-8 w-8 p-0 mx-3"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Area */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={currentTab?.content || ""}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className={`w-full h-full bg-editor-bg text-editor-text p-6 resize-none outline-none font-mono text-sm leading-relaxed tracking-wide transition-all duration-150 ${
              isTyping ? 'animate-pulse-text' : ''
            }`}
            placeholder="Start coding in Lua..."
            spellCheck={false}
          />
          
          {/* Autocomplete Dropdown */}
          {showSuggestions && (
            <AutocompleteDropdown
              suggestions={suggestions}
              position={suggestionPosition}
              onSelect={handleSuggestionSelect}
              onClose={() => setShowSuggestions(false)}
              selectedIndex={selectedSuggestionIndex}
            />
          )}
        </div>
        
        {/* Control Bar between Editor and Console */}
        <div className="flex items-center justify-between bg-editor-panel border-y border-editor-border px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-editor-text-dim hover:bg-control-hover h-8 px-3 text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-editor-text-dim hover:bg-control-hover h-8 px-3 text-xs"
            >
              <Upload className="h-3 w-3 mr-1" />
              Import
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-editor-text-dim hover:bg-control-hover h-8 px-3 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
          <div className="text-editor-text-dim text-xs">
            Lines: {currentTab?.content.split('\n').length || 0}
          </div>
        </div>
        
        {/* Console */}
        <div className="h-32 bg-console-bg">
          <div className="text-editor-text-dim text-xs px-4 py-2 bg-editor-panel border-b border-console-border font-medium">
            Console Output
          </div>
          <div className="p-4 h-full overflow-y-auto">
            <pre className="text-editor-text text-xs font-mono whitespace-pre-wrap leading-relaxed">
              {consoleOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};