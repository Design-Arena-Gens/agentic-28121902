import { For, JSX, Show, createSignal } from "solid-js";
import { FileDescriptor } from "../data/files";
import { fileIcon } from "../lib/fileIcons";

type SidebarProps = {
  files: FileDescriptor[];
  activeFileId: string;
  setActiveFile: (id: string) => void;
  onCreateFile: (path: string, language: FileDescriptor["language"]) => void;
  shortcuts: { combo: string; label: string }[];
};

const Sidebar = (props: SidebarProps): JSX.Element => {
  const [collapsed, setCollapsed] = createSignal(false);
  const [newFileName, setNewFileName] = createSignal("");
  const [newLanguage, setNewLanguage] = createSignal<FileDescriptor["language"]>("tsx");

  const createFile = (event: Event) => {
    event.preventDefault();
    const path = newFileName().trim();
    if (!path) return;
    props.onCreateFile(path, newLanguage());
    setNewFileName("");
  };

  return (
    <aside
      class={`flex shrink-0 flex-col border-r border-border/70 bg-surfaceElevated/60 transition-all duration-300 ${
        collapsed() ? "w-16" : "w-72"
      }`}
    >
      <div class="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <p class="text-xs uppercase tracking-wide text-muted">Project</p>
          <h2 class="text-sm font-semibold text-foreground">agentic-28121902</h2>
        </div>
        <button
          class="rounded-lg border border-border/70 bg-surface px-2 py-1 text-xs text-muted transition hover:border-accent/70 hover:text-accent-foreground"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed() ? "⟨" : "⟩"}
        </button>
      </div>
      <Show
        when={!collapsed()}
        fallback={
          <div class="flex flex-1 flex-col items-center gap-4 px-1 py-4 text-[10px] text-muted">
            <span class="rounded-md border border-border px-1.5 py-1">Files</span>
            <span class="rounded-md border border-border px-1.5 py-1">Chat</span>
            <span class="rounded-md border border-border px-1.5 py-1">Run</span>
          </div>
        }
      >
        <div class="flex-1 overflow-y-auto px-4 py-3">
          <div class="rounded-xl border border-border/70 bg-surface/60 p-3 shadow-inner shadow-black/50">
            <div class="flex items-center justify-between">
              <p class="text-xs uppercase tracking-wide text-muted">Claude Projects</p>
              <span class="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                LIVE
              </span>
            </div>
            <p class="mt-2 text-sm text-foreground/80">
              Realtime co-editing enabled. Claude can propose, diff, and apply changes directly.
            </p>
          </div>
          <section class="mt-4">
            <p class="text-xs uppercase tracking-wide text-muted">Files</p>
            <div class="mt-2 space-y-1">
              <For each={props.files}>
                {(file) => (
                  <button
                    class={`group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-sm transition hover:border-border/70 hover:bg-surfaceElevated ${
                      file.id === props.activeFileId ? "border-accent/40 bg-surfaceElevated" : ""
                    }`}
                    onClick={() => props.setActiveFile(file.id)}
                  >
                    <span class="text-lg">{fileIcon(file)}</span>
                    <div class="flex flex-col">
                      <span class="font-medium text-foreground/90">{file.path.split("/").pop()}</span>
                      <span class="text-xs text-muted">{file.path}</span>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </section>
          <form class="mt-4 space-y-2 rounded-xl border border-border/60 bg-surface/70 p-3" onSubmit={createFile}>
            <p class="text-xs uppercase tracking-wide text-muted">New File</p>
            <input
              class="w-full rounded-lg border border-border/60 bg-surfaceElevated px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent/70"
              placeholder="src/components/Preview.tsx"
              value={newFileName()}
              onInput={(event) => setNewFileName(event.currentTarget.value)}
            />
            <select
              class="w-full rounded-lg border border-border/60 bg-surfaceElevated px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent/70"
              value={newLanguage()}
              onInput={(event) =>
                setNewLanguage(event.currentTarget.value as FileDescriptor["language"])
              }
            >
              <option value="tsx">Solid TSX</option>
              <option value="ts">TypeScript</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
            </select>
            <button class="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent/85">
              Create file
            </button>
          </form>
        </div>
        <div class="border-t border-border/60 px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-muted">Shortcuts</p>
          <ul class="mt-2 space-y-1 text-xs text-muted">
            <For each={props.shortcuts}>
              {(shortcut) => (
                <li class="flex items-center justify-between rounded-lg border border-border/50 bg-surface/60 px-3 py-2">
                  <span>{shortcut.label}</span>
                  <span class="font-semibold text-foreground/80">{shortcut.combo}</span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </aside>
  );
};

export default Sidebar;
