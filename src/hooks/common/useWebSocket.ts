import type { AppDispatch, RootState } from "@/app/store";
import {
  socketConnect,
  socketEmit,
  type SocketEvent,
} from "@/app/ws/socket.middleware";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const connected = useSelector(
    (state: RootState) => state.notifications.connected,
  );

  useEffect(() => {
    if (!token) return;

    dispatch(socketConnect(token));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const emit = (event: SocketEvent, data?: unknown) =>
    dispatch(socketEmit(event, data));

  return { emit, connected };
};

export default useWebSocket;
