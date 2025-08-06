import { useState } from "react";
import { X, Plus, Play, Square, Settings, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tab {
  id: string;
  name: string;
  content: string;
}

export const CodeEditor = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "1", name: "Untitled 1", content: "// Start coding here...\n\n" }
  ]);
  const [activeTab, setActiveTab] = useState("1");
  const [consoleOutput, setConsoleOutput] = useState("Console Output\n");
  const [isMinimized, setIsMinimized] = useState(false);

  const addTab = () => {
    const newId = Date.now().toString();
    const newTab = {
      id: newId,
      name: `Untitled ${tabs.length + 1}`,
      content: "// New file...\n\n"
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
      setConsoleOutput(prev => prev + `\n> Running ${currentTab.name}...\n> Output: Hello World!`);
    }
  };

  const updateContent = (content: string) => {
    setTabs(tabs.map(tab => 
      tab.id === activeTab ? { ...tab, content } : tab
    ));
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-editor-panel border border-editor-border rounded p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(false)}
          className="text-editor-text hover:bg-control-hover"
        >
          <Maximize2 className="h-4 w-4" />
          Oppenheimer Executor
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto h-screen bg-editor-bg border border-editor-border rounded-lg overflow-hidden flex flex-col">
      {/* Title Bar */}
      <div className="flex items-center justify-between bg-editor-panel border-b border-editor-border px-4 py-2">
        <h1 className="text-editor-text font-medium text-sm">Oppenheimer Executor</h1>
        <div className="flex items-center gap-2">
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
      <div className="flex items-center bg-editor-panel border-b border-editor-border">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-3 py-2 text-sm border-r border-editor-border cursor-pointer transition-colors ${
              activeTab === tab.id
                ? "bg-accent text-accent-foreground border-b-2 border-accent"
                : "text-editor-text-dim hover:bg-control-hover"
            }`}
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
                className="h-4 w-4 p-0 hover:bg-control-hover"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={addTab}
          className="text-editor-text-dim hover:bg-control-hover h-8 w-8 p-0 mx-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={currentTab?.content || ""}
            onChange={(e) => updateContent(e.target.value)}
            className="flex-1 bg-editor-bg text-editor-text p-4 resize-none outline-none font-mono text-sm leading-relaxed"
            placeholder="Start coding..."
            spellCheck={false}
          />
          
          {/* Console */}
          <div className="h-32 bg-console-bg border-t border-console-border">
            <div className="text-editor-text-dim text-xs px-4 py-1 bg-editor-panel border-b border-console-border">
              Console Output
            </div>
            <div className="p-4 h-full overflow-y-auto">
              <pre className="text-editor-text text-xs font-mono whitespace-pre-wrap">
                {consoleOutput}
              </pre>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-16 bg-editor-panel border-l border-editor-border flex flex-col items-center py-4 gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={runCode}
            className="w-10 h-10 rounded-full bg-control-bg hover:bg-control-hover text-editor-text"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full bg-control-bg hover:bg-control-hover text-editor-text"
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 rounded-full bg-control-bg hover:bg-control-hover text-editor-text"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};