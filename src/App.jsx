import { createSignal, createMemo, onCleanup } from "solid-js";
import { Dynamic } from "solid-js/web";
import Sidebar from "./components/Sidebar";
import ChatPanel from "./components/ChatPanel";
import EditorPanel from "./components/EditorPanel";
import TopBar from "./components/TopBar";
import { assistants } from "./data/assistants";
import { starterFiles } from "./data/files";
import { createEventBus } from "./lib/eventBus";
import CommandPalette from "./components/CommandPalette";
const bus = createEventBus();
const App = () => {
    const [activeAssistant, setActiveAssistant] = createSignal(assistants[0]);
    const [files, setFiles] = createSignal(starterFiles);
    const [activeFileId, setActiveFileId] = createSignal(starterFiles[0].id);
    const [paletteOpen, setPaletteOpen] = createSignal(false);
    const activeFile = createMemo(() => files().find((file) => file.id === activeFileId()));
    const updateFileContent = (id, nextContent) => {
        setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, content: nextContent } : file)));
    };
    const handleFileCreate = (path, language) => {
        const next = {
            id: crypto.randomUUID(),
            path,
            language,
            content: ""
        };
        setFiles((prev) => [...prev, next]);
        setActiveFileId(next.id);
    };
    const handlePaletteToggle = (value) => setPaletteOpen(value);
    const shortcuts = [
        { combo: "⌘K", label: "Command palette" },
        { combo: "⌘Enter", label: "Send message" },
        { combo: "⌘B", label: "Toggle sidebar" }
    ];
    const handleKeydown = (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            setPaletteOpen((prev) => !prev);
        }
    };
    window.addEventListener("keydown", handleKeydown);
    onCleanup(() => window.removeEventListener("keydown", handleKeydown));
    return (<div class="flex min-h-screen flex-col bg-background">
      <TopBar assistants={assistants} value={activeAssistant()} onSelect={setActiveAssistant}/>
      <div class="flex flex-1 overflow-hidden">
        <Sidebar files={files()} activeFileId={activeFileId()} setActiveFile={setActiveFileId} onCreateFile={handleFileCreate} shortcuts={shortcuts}/>
        <main class="flex flex-1 gap-6 overflow-hidden px-6 pb-6">
          <ChatPanel assistant={activeAssistant()} bus={bus} onInsertCode={(snippet) => {
            const current = activeFile();
            if (!current)
                return;
            updateFileContent(current.id, `${current.content}\n${snippet}`);
        }}/>
          <EditorPanel file={activeFile()} onChange={(content) => {
            const file = activeFile();
            if (!file)
                return;
            updateFileContent(file.id, content);
        }} onCommandToggle={handlePaletteToggle}/>
        </main>
      </div>
      <Dynamic component={CommandPalette} open={paletteOpen()} onClose={() => setPaletteOpen(false)}/>
    </div>);
};
export default App;
