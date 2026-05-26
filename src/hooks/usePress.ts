import { useRef } from "react";

type UsePressOptions = {
  delay?: number;
  onLongPress: () => void;
  onClick?: () => void;
};

const usePress = ({ delay = 600, onLongPress, onClick }: UsePressOptions) => {
  const timerRef = useRef<number | null>(null);
  const longPressTriggered = useRef(false);

  const start = () => {
    longPressTriggered.current = false;

    timerRef.current = window.setTimeout(() => {
      onLongPress();
      longPressTriggered.current = true;
    }, delay);
  };

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePointerUp = () => {
    if (!longPressTriggered.current) {
      onClick?.();
    }
    cancel();
  };

  return {
    onPointerDown: start,
    onPointerUp: handlePointerUp,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
  };
};

export default usePress;
