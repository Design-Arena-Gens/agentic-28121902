import { For, JSX, Show, createEffect, createMemo, onCleanup, onMount } from "solid-js";
import { EditorState, StateEffect } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { FileDescriptor } from "../data/files";
import { createUniqueId } from "solid-js";

type EditorPanelProps = {
  file: FileDescriptor | undefined;
  onChange: (content: string) => void;
  onCommandToggle: (value: boolean) => void;
};

const languageExtensions = (file?: FileDescriptor) => {
  switch (file?.language) {
    case "tsx":
    case "ts":
      return [javascript({ jsx: true, typescript: true })];
    case "css":
      return [css()];
    case "json":
      return [json()];
    default:
      return [javascript({ jsx: true, typescript: true })];
  }
};

const EditorPanel = (props: EditorPanelProps): JSX.Element => {
  let containerRef: HTMLDivElement | undefined;
  let view: EditorView | undefined;

  const breadcrumb = createMemo(() => props.file?.path.split("/") ?? []);

  const buildExtensions = (file: FileDescriptor) => [
    lineNumbers(),
    keymap.of([indentWithTab]),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    oneDark,
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        props.onChange(update.state.doc.toString());
      }
    }),
    ...languageExtensions(file)
  ];

  const createView = () => {
    if (!containerRef || !props.file) return;

    const state = EditorState.create({
      doc: props.file.content,
      extensions: buildExtensions(props.file)
    });

    view = new EditorView({
      state,
      parent: containerRef
    });
  };

  onMount(createView);

  createEffect(() => {
    if (!view || !props.file) return;
    const doc = view.state.doc.toString();
    if (doc !== props.file.content) {
      view.dispatch({
        changes: { from: 0, to: doc.length, insert: props.file.content }
      });
    }
    view.dispatch({
      effects: StateEffect.reconfigure.of(buildExtensions(props.file))
    });
  });

  onCleanup(() => view?.destroy());

  return (
    <section class="flex min-w-[420px] max-w-xl flex-1 flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-surface/80 p-5 shadow-glow">
      <header class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
          <span class="rounded-md border border-border px-2 py-1">Editor</span>
          <Show when={props.file} fallback={<span>No file selected</span>}>
            <div class="flex items-center gap-1">
              <For each={breadcrumb()}>
                {(segment, index) => (
                  <>
                    <span class="text-muted">{segment}</span>
                    <Show when={index() !== breadcrumb().length - 1}>
                      <span class="text-border">/</span>
                    </Show>
                  </>
                )}
              </For>
            </div>
          </Show>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="rounded-lg border border-border/60 bg-surface px-3 py-2 text-xs text-muted transition hover:border-accent/60 hover:text-accent-foreground"
            onClick={() => props.onCommandToggle(true)}
          >
            Command palette
          </button>
          <button
            class="rounded-lg border border-border/60 bg-surface px-3 py-2 text-xs text-muted transition hover:border-accent/60 hover:text-accent-foreground"
            onClick={() => {
              if (!props.file) return;
              navigator.clipboard.writeText(props.file.content);
            }}
          >
            Copy file
          </button>
        </div>
      </header>
      <div class="flex items-center gap-2 rounded-xl border border-border/60 bg-surfaceElevated px-4 py-3 text-xs text-muted">
        <span class="rounded-md border border-border px-2 py-1">Status</span>
        <span class="font-semibold text-foreground/90">Synced with Claude suggestions</span>
        <span class="rounded-md border border-border px-2 py-1 text-emerald-300">Auto-save</span>
      </div>
      <div class="relative flex-1 overflow-hidden rounded-xl border border-border/60 bg-codeBg">
        <Show when={props.file} fallback={<EmptyState />}>
          <div class="absolute inset-0" ref={(element) => (containerRef = element)} />
        </Show>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <SummaryCard
          title="Claude Alignment"
          description="Diffs prepared for review. Use ⌘+Enter to accept or request revisions."
          badge="Ready"
        />
        <SummaryCard
          title="Playground Preview"
          description="Run `npm run dev` or trigger sandbox preview to validate updates."
          badge="Next"
        />
      </div>
    </section>
  );
};

const SummaryCard = (props: { title: string; description: string; badge: string }) => {
  const id = createUniqueId();
  return (
    <div class="rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-muted">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foreground/90">{props.title}</h3>
        <span class="rounded-md border border-border px-2 py-1 text-xs text-accent-foreground">
          {props.badge}
        </span>
      </div>
      <p class="mt-2 text-xs text-muted" id={id}>
        {props.description}
      </p>
    </div>
  );
};

const EmptyState = () => (
  <div class="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted">
    <span class="text-3xl">🗂️</span>
    <p>Select a file from the project panel to begin editing.</p>
  </div>
);

export default EditorPanel;
