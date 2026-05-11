import * as signalR from "@microsoft/signalr";
import { getSignalRUrl } from "./api";

let connection: signalR.HubConnection | null = null;
let currentUserId: string | null = null;
let currentToken: string | null = null;

export type SignalREventHandler = (...args: unknown[]) => void;

const handlers = new Map<string, Set<SignalREventHandler>>();

const registerHandlers = (conn: signalR.HubConnection) => {
  handlers.forEach((set, event) => {
    conn.on(event, (...args) => set.forEach((h) => h(...args)));
  });
};

export const getConnection = (): signalR.HubConnection | null => connection;

export const connectSignalR = async (token: string, userId: string): Promise<signalR.HubConnection> => {
  if (connection && currentToken === token && currentUserId === userId) {
    if (connection.state === signalR.HubConnectionState.Connected) return connection;
  }

  if (connection) {
    try { await connection.stop(); } catch { /* noop */ }
    connection = null;
  }

  const url = `${getSignalRUrl()}?access_token=${encodeURIComponent(token)}`;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(url, { accessTokenFactory: () => token })
    .withAutomaticReconnect([0, 1000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  registerHandlers(connection);

  connection.onreconnected(async () => {
    try { await connection?.invoke("JoinCustomerGroup", userId); } catch { /* noop */ }
  });

  await connection.start();
  try { await connection.invoke("JoinCustomerGroup", userId); } catch { /* noop */ }

  currentToken = token;
  currentUserId = userId;
  return connection;
};

export const disconnectSignalR = async (): Promise<void> => {
  if (!connection) return;
  try {
    if (currentUserId) {
      try { await connection.invoke("LeaveCustomerGroup", currentUserId); } catch { /* noop */ }
    }
    await connection.stop();
  } catch { /* noop */ }
  connection = null;
  currentToken = null;
  currentUserId = null;
};

export const onHubEvent = (event: string, handler: SignalREventHandler): (() => void) => {
  if (!handlers.has(event)) handlers.set(event, new Set());
  handlers.get(event)!.add(handler);
  if (connection) connection.on(event, handler);
  return () => offHubEvent(event, handler);
};

export const offHubEvent = (event: string, handler: SignalREventHandler): void => {
  handlers.get(event)?.delete(handler);
  if (connection) connection.off(event, handler);
};
