import type { AppDispatch, RootState } from "@/app/store";
import {
  socketConnect,
  socketEmit,
  type SocketEvent,
} from "@/app/ws/socket.middleware";
import { STORAGE_KEYS } from "@/constants";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const useWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const connected = useSelector(
    (state: RootState) => state.notifications.connected,
  );

  const [token, setToken] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  );

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
    };

    window.addEventListener("auth-storage-changed", handleAuthChange);
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEYS.AUTH_TOKEN) {
        handleAuthChange();
      }
    });

    return () => {
      window.removeEventListener("auth-storage-changed", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    dispatch(socketConnect(token));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const emit = useCallback(
    (event: SocketEvent, data?: unknown) => dispatch(socketEmit(event, data)),
    [dispatch],
  );

  return { emit, connected };
};

export default useWebSocket;
