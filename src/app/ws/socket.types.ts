// ---------------------------------------------------------------------------
// Типизированные события и actions для socket middleware
// ---------------------------------------------------------------------------

export type SocketEvent = "notification:seen" | "ping";

export const actions = {
  SOCKET_CONNECT: "socket/connect",
  SOCKET_DISCONNECT: "socket/disconnect",
  SOCKET_EMIT: "socket/emit",
} as const;

export const PING_INTERVAL_MS = 30_000;

export const socketConnect = (token: string) => ({
  type: actions.SOCKET_CONNECT,
  payload: token,
});

export const socketDisconnect = () => ({
  type: actions.SOCKET_DISCONNECT,
});

export const socketEmit = (event: SocketEvent, data?: unknown) => ({
  type: actions.SOCKET_EMIT,
  payload: { event, data },
});

export type SocketAction =
  | ReturnType<typeof socketConnect>
  | ReturnType<typeof socketDisconnect>
  | ReturnType<typeof socketEmit>;

export function isSocketAction(action: unknown): action is SocketAction {
  return (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    Object.values(actions).includes(
      (action as { type: string })
        .type as (typeof actions)[keyof typeof actions],
    )
  );
}
