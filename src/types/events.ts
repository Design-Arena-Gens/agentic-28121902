import { createEventBus } from "../lib/eventBus";

export type EventBus = ReturnType<typeof createEventBus>;
