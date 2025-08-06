import { useState } from "react";
import { X, Plus, Play, Settings, Minimize2, Maximize2, Save, Upload, Download } from "lucide-react";
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
        <textarea
          value={currentTab?.content || ""}
          onChange={(e) => updateContent(e.target.value)}
          className="flex-1 bg-editor-bg text-editor-text p-6 resize-none outline-none font-mono text-sm leading-relaxed tracking-wide"
          placeholder="Start coding..."
          spellCheck={false}
        />
        
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