import type { ChangeStream } from "mongodb";
import { mongoClient } from "@/lib/mongo";

const COLLECTION = "Post";
const RESTART_MS = 5000;

type Listener = () => void;

type Hub = {
  stream: ChangeStream | null;
  opening: Promise<void> | null;
  listeners: Set<Listener>;
  restartTimer: ReturnType<typeof setTimeout> | null;
  loggedFailure: boolean;
};

const globalForHub = globalThis as unknown as { postHub?: Hub };

function hub(): Hub {
  if (!globalForHub.postHub) {
    globalForHub.postHub = {
      stream: null,
      opening: null,
      listeners: new Set(),
      restartTimer: null,
      loggedFailure: false,
    };
  }
  return globalForHub.postHub;
}

function safeMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return message.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "mongodb://***");
}

function logFailure(error: unknown) {
  const state = hub();
  if (state.loggedFailure) return;
  state.loggedFailure = true;
  console.error("글 변경 스트림을 열지 못했습니다.", safeMessage(error));
}

function dispatch() {
  for (const listener of hub().listeners) listener();
}

function dropStream() {
  const state = hub();
  const stream = state.stream;
  state.stream = null;
  if (stream) void stream.close().catch(() => undefined);
}

function scheduleRestart() {
  const state = hub();
  if (state.restartTimer || state.listeners.size === 0) return;
  state.restartTimer = setTimeout(() => {
    state.restartTimer = null;
    if (state.listeners.size > 0) void openStream();
  }, RESTART_MS);
}

async function openStream() {
  const state = hub();
  if (state.stream) return;
  if (state.opening) return state.opening;
  state.opening = connect().finally(() => {
    hub().opening = null;
  });
  return state.opening;
}

async function connect() {
  try {
    const client = await mongoClient();
    const stream = client
      .db()
      .collection(COLLECTION)
      .watch([{ $match: { operationType: "insert" } }]);
    const state = hub();
    state.stream = stream;
    state.loggedFailure = false;
    stream.on("change", () => {
      dispatch();
    });
    stream.on("error", (error) => {
      logFailure(error);
      dropStream();
      scheduleRestart();
    });
    stream.on("close", () => {
      if (hub().stream !== stream) return;
      hub().stream = null;
      scheduleRestart();
    });
  } catch (error) {
    logFailure(error);
    dropStream();
    scheduleRestart();
  }
}

function subscribe(listener: Listener) {
  const state = hub();
  state.listeners.add(listener);
  void openStream();
  return () => {
    state.listeners.delete(listener);
  };
}

function whenReady() {
  if (hub().stream) return Promise.resolve();
  return openStream();
}

export const postWatch = {
  subscribe,
  whenReady,
};
