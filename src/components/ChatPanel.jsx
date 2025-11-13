import { For, Show, createEffect, createSignal, onCleanup } from "solid-js";
import { format } from "../lib/format";
import { createUniqueId } from "solid-js";
const templateSuggestions = [
    "Describe the architecture for a collaborative code editor.",
    "Refactor the SolidJS component structure for better state management.",
    "Generate starter tests for the chat pipeline and editor actions."
];
const buildInitialMessage = (assistant) => ({
    id: crypto.randomUUID(),
    role: "assistant",
    time: new Date(),
    status: "complete",
    content: `Hi there! I'm ${assistant.name}. I'm tuned for ${assistant.strengths
        .slice(0, 2)
        .join(" and ")}. Drop in your task and I'll help with structured plans, diffs, and ready-to-apply patches.`
});
const ChatPanel = (props) => {
    const [messages, setMessages] = createSignal([buildInitialMessage(props.assistant)]);
    const [input, setInput] = createSignal("");
    const [suggestionIndex, setSuggestionIndex] = createSignal(0);
    const timers = new Set();
    createEffect(() => {
        setMessages((prev) => [buildInitialMessage(props.assistant), ...prev.slice(1)]);
    });
    const cleanupTimers = () => {
        timers.forEach((timer) => clearInterval(timer));
        timers.clear();
    };
    onCleanup(cleanupTimers);
    const sendMessage = () => {
        const value = input().trim();
        if (!value)
            return;
        const userMessage = {
            id: createUniqueId(),
            role: "user",
            content: value,
            status: "sent",
            time: new Date()
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        const assistantMessage = {
            id: createUniqueId(),
            role: "assistant",
            content: "",
            status: "streaming",
            time: new Date(),
            highlights: [
                "Proposed file diffs ready to review",
                "Inline rationale for each operation",
                "Actions to run tests & preview changes"
            ]
        };
        setMessages((prev) => [...prev, assistantMessage]);
        simulateAssistantResponse(assistantMessage.id, value);
    };
    const simulateAssistantResponse = (messageId, prompt) => {
        const blueprints = [
            "1. Understand goals from conversation\n2. Generate structured plan block\n3. Produce diff-ready patches\n4. Summarize testing status",
            `Architecture Summary\n- Identified ${prompt.length > 80 ? "complex" : "lightweight"} component graph\n- Suggested progressive enhancement for streaming tokens\n\nRecommended Tasks\n- [ ] Wire up Realtime updates\n- [ ] Add review queue with diff viewer\n- [ ] Capture command palette telemetry`,
            "Next Steps:\n• Review code diff suggestions\n• Trigger sandbox run (⌘ + ⇧ + R)\n• Approve commit or request revisions"
        ];
        const chunks = blueprints.join("\n\n").split(" ");
        let index = 0;
        const timer = window.setInterval(() => {
            index++;
            setMessages((prev) => prev.map((message) => message.id === messageId
                ? {
                    ...message,
                    content: `${message.content} ${chunks[index - 1] ?? ""}`.trim()
                }
                : message));
            if (index >= chunks.length) {
                clearInterval(timer);
                timers.delete(timer);
                setMessages((prev) => prev.map((message) => message.id === messageId
                    ? {
                        ...message,
                        status: "complete",
                        content: format.markdown(message.content)
                    }
                    : message));
            }
        }, 35);
        timers.add(timer);
    };
    return (<section class="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-surface/70 p-5 shadow-glow">
      <header class="flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-foreground/90">Claude Chat</h2>
          <p class="text-sm text-muted">
            Streaming responses, inline code patches, and multi-step plans tailored to your task.
          </p>
        </div>
        <div class="hidden items-center gap-2 text-xs text-muted md:flex">
          <span class="rounded-md border border-border px-2 py-1 uppercase tracking-wide">
            {props.assistant.tone}
          </span>
          <span class="rounded-md border border-border px-2 py-1">
            Temp {Math.round(props.assistant.temperature * 100) / 100}
          </span>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto rounded-xl border border-border/60 bg-surface/80 p-4">
        <For each={messages()}>
          {(message) => (<article class={`mb-4 flex gap-3 rounded-xl border border-transparent p-4 transition ${message.role === "assistant" ? "bg-surfaceElevated/60" : "bg-surface"}`}>
              <div class={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/80 text-sm font-semibold ${message.role === "assistant" ? "bg-accent/15 text-accent-foreground" : "bg-surface/80 text-muted"}`}>
                {message.role === "assistant" ? "λ" : "You"}
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
                  <span>{message.role === "assistant" ? props.assistant.name : "You"}</span>
                  <span>•</span>
                  <time>{message.time.toLocaleTimeString()}</time>
                  <Show when={message.status === "streaming"}>
                    <span class="animate-pulse text-accent-foreground/80">Streaming...</span>
                  </Show>
                </div>
                <div class="prose prose-invert max-w-none text-sm leading-relaxed text-foreground/90">
                  <pre class="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content || "…"}
                  </pre>
                </div>
                <Show when={message.highlights}>
                  <ul class="mt-2 space-y-1 text-xs text-muted">
                    <For each={message.highlights}>
                      {(item) => (<li class="flex items-center gap-2 rounded-lg border border-border/50 bg-surface/60 px-3 py-1.5">
                          <span class="text-accent-foreground">◎</span>
                          <span>{item}</span>
                        </li>)}
                    </For>
                  </ul>
                </Show>
                <div class="flex gap-2 text-xs text-muted">
                  <button class="rounded-lg border border-border/70 bg-surface px-3 py-1 transition hover:border-accent/60 hover:text-accent-foreground" onClick={() => props.onInsertCode("// Apply patch\n" + message.content)}>
                    Insert into editor
                  </button>
                  <button class="rounded-lg border border-border/70 bg-surface px-3 py-1 transition hover:border-accent/60 hover:text-accent-foreground" onClick={() => navigator.clipboard.writeText(message.content)}>
                    Copy
                  </button>
                </div>
              </div>
            </article>)}
        </For>
      </div>

      <div class="rounded-2xl border border-border/60 bg-surface/80 p-4">
        <div class="flex items-center gap-2 text-xs text-muted">
          <span class="rounded-md border border-border/60 bg-surface px-2 py-1">Assist</span>
          <span>Claude drafts code diffs and test plans automatically.</span>
        </div>
        <textarea class="mt-3 h-28 w-full resize-none rounded-xl border border-border/60 bg-codeBg px-4 py-3 text-sm text-foreground outline-none transition focus:border-accent/70" placeholder="Ask Claude to review the Solid state management or generate feature scaffolding..." value={input()} onInput={(event) => setInput(event.currentTarget.value)} onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }
        }}/>
        <div class="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div class="flex gap-2">
            <For each={templateSuggestions}>
              {(suggestion, index) => (<button class={`rounded-xl border px-3 py-2 text-xs transition ${suggestionIndex() === index()
                ? "border-accent/60 bg-accent/10 text-foreground"
                : "border-border/60 bg-surface text-muted"}`} onClick={() => {
                setSuggestionIndex(index());
                setInput(suggestion);
            }}>
                  {suggestion}
                </button>)}
            </For>
          </div>
          <div class="flex items-center gap-2">
            <button class="rounded-xl border border-border/60 bg-surface px-3 py-2 text-xs text-muted transition hover:border-accent/60 hover:text-accent-foreground" onClick={() => {
            setInput("");
            props.bus.emit("chat:clear", {});
        }}>
              Clear
            </button>
            <button class="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/85" onClick={sendMessage}>
              Send ↵
            </button>
          </div>
        </div>
      </div>
    </section>);
};
export default ChatPanel;
