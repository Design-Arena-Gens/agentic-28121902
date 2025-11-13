import { JSX, Show } from "solid-js";
import { AssistantPreset } from "../data/assistants";

type TopBarProps = {
  assistants: AssistantPreset[];
  value: AssistantPreset;
  onSelect: (assistant: AssistantPreset) => void;
};

const TopBar = (props: TopBarProps): JSX.Element => {
  return (
    <header class="flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-surfaceElevated/70 px-6 backdrop-blur-lg">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-lg font-semibold text-accent-foreground shadow-lg shadow-accent/20">
          λ
        </div>
        <div>
          <p class="text-sm font-medium uppercase tracking-wide text-muted">Workspace</p>
          <h1 class="text-lg font-semibold text-foreground">Claude Code Clone</h1>
        </div>
      </div>
      <div class="flex flex-1 items-center justify-center gap-4">
        <div class="flex items-center gap-3 rounded-xl border border-border/80 bg-surface px-3 py-2 shadow-inner shadow-black/40">
          <Show when={props.assistants.length > 0}>
            <select
              class="w-52 rounded-lg border border-border/60 bg-surfaceElevated px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent/70"
              value={props.value.id}
              onInput={(event) => {
                const next = props.assistants.find(
                  (assistant) => assistant.id === event.currentTarget.value
                );
                if (next) props.onSelect(next);
              }}
            >
              {props.assistants.map((assistant) => (
                <option value={assistant.id}>{assistant.name}</option>
              ))}
            </select>
          </Show>
          <div class="flex flex-col text-xs text-muted">
            <span class="font-semibold text-foreground/90">{props.value.description}</span>
            <span>{props.value.strengths.join(" • ")}</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3 text-xs text-muted">
        <div class="hidden items-center gap-2 rounded-lg border border-border/80 bg-surface px-3 py-2 shadow-inner shadow-black/40 md:flex">
          <div>
            <p class="font-semibold text-foreground/80">Project: agentic-28121902</p>
            <p>Auto-save enabled · Vercel Ready</p>
          </div>
        </div>
        <button class="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-surface shadow-inner shadow-black/30 transition hover:border-accent/60">
          <span class="text-sm font-medium text-accent-foreground">AK</span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
