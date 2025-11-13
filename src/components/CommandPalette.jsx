import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
const defaultCommands = [
    { group: "Claude", label: "Accept suggested diff", shortcut: "⌘⏎" },
    { group: "Claude", label: "Request alternative patch", shortcut: "⌥⏎" },
    { group: "Project", label: "Run preview build", shortcut: "⌘B" },
    { group: "Project", label: "Open deployment dashboard", shortcut: "⌘D" },
    { group: "Navigation", label: "Toggle chat focus", shortcut: "⌘1" },
    { group: "Navigation", label: "Toggle editor focus", shortcut: "⌘2" }
];
const CommandPalette = (props) => {
    const [query, setQuery] = createSignal("");
    const commands = () => defaultCommands.filter((command) => command.label.toLowerCase().includes(query().toLowerCase()));
    const handleKeydown = (event) => {
        if (event.key === "Escape")
            props.onClose();
    };
    onMount(() => window.addEventListener("keydown", handleKeydown));
    onCleanup(() => window.removeEventListener("keydown", handleKeydown));
    return (<Show when={props.open}>
      <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 py-24 backdrop-blur-sm">
        <div class="w-full max-w-xl rounded-2xl border border-border/70 bg-surfaceElevated/95 shadow-2xl shadow-accent/20">
          <div class="border-b border-border/60 px-4 py-3">
            <input class="w-full rounded-lg border border-border/70 bg-surface px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent/60" autofocus placeholder="Type a command or search for actions..." value={query()} onInput={(event) => setQuery(event.currentTarget.value)}/>
          </div>
          <div class="max-h-72 overflow-y-auto px-4 py-3">
            <Show when={commands().length > 0} fallback={<EmptyState />}>
              <For each={commands()}>
                {(command) => (<div class="flex items-center justify-between border-b border-border/20 py-2 text-sm text-muted last:border-none">
                    <div>
                      <p class="font-medium text-foreground/90">{command.label}</p>
                      <p class="text-xs uppercase tracking-wide">{command.group}</p>
                    </div>
                    <span class="rounded-md border border-border/60 px-2 py-1 text-xs text-foreground/70">
                      {command.shortcut}
                    </span>
                  </div>)}
              </For>
            </Show>
          </div>
          <div class="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted">
            <span>Press Esc to close</span>
            <button class="rounded-lg border border-border/60 bg-surface px-3 py-1 transition hover:border-accent/60 hover:text-accent-foreground" onClick={props.onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </Show>);
};
const EmptyState = () => (<div class="flex flex-col items-center gap-3 py-8 text-sm text-muted">
    <span class="text-xl">🤔</span>
    <p>No matching commands. Try a different phrase.</p>
  </div>);
export default CommandPalette;
