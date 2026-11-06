import type { ChangeStream, Db } from "mongodb";
import { mongoClient } from "@/lib/mongo";
import { toNotificationItem } from "@/service/notificationItem";
import type { NotificationLiveEvent } from "@/types/notification";

const COLLECTION = "Notification";
const RESTART_MS = 5000;

type Listener = (event: NotificationLiveEvent) => void;

type NotificationDoc = {
  _id?: unknown;
  recipientId?: unknown;
  actorName?: unknown;
  kind?: unknown;
  postId?: unknown;
  readAt?: unknown;
  createdAt?: unknown;
};

type NotificationChange = {
  operationType: string;
  fullDocument?: NotificationDoc | null;
  fullDocumentBeforeChange?: NotificationDoc | null;
  documentKey?: { _id?: unknown };
  updateDescription?: { updatedFields?: Record<string, unknown> };
};

type Hub = {
  stream: ChangeStream | null;
  opening: Promise<void> | null;
  listeners: Map<string, Set<Listener>>;
  restartTimer: ReturnType<typeof setTimeout> | null;
  imagesEnabled: boolean;
  loggedFailure: boolean;
};

const globalForHub = globalThis as unknown as { notificationHub?: Hub };

function hub(): Hub {
  if (!globalForHub.notificationHub) {
    globalForHub.notificationHub = {
      stream: null,
      opening: null,
      listeners: new Map(),
      restartTimer: null,
      imagesEnabled: false,
      loggedFailure: false,
    };
  }
  return globalForHub.notificationHub;
}

function safeMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  return message.replace(/mongodb(?:\+srv)?:\/\/\S+/gi, "mongodb://***");
}

function logFailure(error: unknown) {
  const state = hub();
  if (state.loggedFailure) return;
  state.loggedFailure = true;
  console.error("알림 변경 스트림을 열지 못했습니다.", safeMessage(error));
}

function hexId(value: unknown) {
  if (typeof value === "string" && /^[a-f\d]{24}$/i.test(value)) return value;
  if (value && typeof value === "object" && "toHexString" in value) {
    const hex = (value as { toHexString: () => string }).toHexString();
    return typeof hex === "string" ? hex : null;
  }
  return null;
}

function text(value: unknown) {
  return typeof value === "string" ? value : null;
}

function dateOf(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

function recipientIdOf(doc: NotificationDoc | null | undefined) {
  return text(doc?.recipientId);
}

function itemFrom(doc: NotificationDoc | null | undefined) {
  const id = hexId(doc?._id);
  const actorName = text(doc?.actorName);
  const postId = text(doc?.postId);
  const kind = text(doc?.kind);
  if (!doc || !id || !actorName || !postId || !kind) return null;
  return toNotificationItem({
    id,
    kind,
    actorName,
    postId,
    readAt: dateOf(doc.readAt),
    createdAt: dateOf(doc.createdAt) ?? new Date(),
  });
}

function toEvent(change: NotificationChange): NotificationLiveEvent | null {
  if (change.operationType === "insert") {
    const item = itemFrom(change.fullDocument);
    return item ? { type: "insert", item } : null;
  }
  if (change.operationType === "delete") {
    const id = hexId(change.documentKey?._id);
    return id ? { type: "delete", id } : null;
  }
  if (change.operationType === "update") {
    const fields = change.updateDescription?.updatedFields;
    if (!fields || !Object.prototype.hasOwnProperty.call(fields, "readAt")) return null;
    const id = hexId(change.documentKey?._id);
    return id ? { type: "read", id } : null;
  }
  if (change.operationType === "replace" && dateOf(change.fullDocument?.readAt)) {
    const id = hexId(change.documentKey?._id);
    return id ? { type: "read", id } : null;
  }
  return null;
}

function emit(recipientId: string, event: NotificationLiveEvent) {
  const listeners = hub().listeners.get(recipientId);
  if (!listeners) return;
  for (const listener of [...listeners]) {
    try {
      listener(event);
    } catch {
      listeners.delete(listener);
    }
  }
  if (listeners.size === 0) hub().listeners.delete(recipientId);
}

function dispatch(change: NotificationChange) {
  const doc =
    change.operationType === "delete" ? change.fullDocumentBeforeChange : change.fullDocument;
  const recipientId = recipientIdOf(doc);
  const event = toEvent(change);
  if (!recipientId || !event) return;
  emit(recipientId, event);
}

async function enableImages(db: Db) {
  const state = hub();
  if (state.imagesEnabled) return;
  try {
    await db.command({
      collMod: COLLECTION,
      changeStreamPreAndPostImages: { enabled: true },
    });
    state.imagesEnabled = true;
  } catch {
    state.imagesEnabled = false;
  }
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
    const db = client.db();
    await enableImages(db);
    const stream = db.collection<NotificationDoc>(COLLECTION).watch([], {
      fullDocument: "updateLookup",
      fullDocumentBeforeChange: "whenAvailable",
    });
    const state = hub();
    state.stream = stream;
    state.loggedFailure = false;
    stream.on("change", (change) => {
      dispatch(change as NotificationChange);
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

function subscribe(recipientId: string, listener: Listener) {
  const state = hub();
  const listeners = state.listeners.get(recipientId) ?? new Set<Listener>();
  listeners.add(listener);
  state.listeners.set(recipientId, listeners);
  void openStream();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) hub().listeners.delete(recipientId);
  };
}

function whenReady() {
  if (hub().stream) return Promise.resolve();
  return openStream();
}

export const notificationWatch = {
  subscribe,
  whenReady,
};
