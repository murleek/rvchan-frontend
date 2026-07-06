import { useSpring, type SpringConfig } from "@react-spring/web";
import { useCallback, useState } from "react";

const useButtonStyle = (config: SpringConfig) => {
  const [rawStyle, setRawStyle] = useState<{
    x: number;
    scale: number;
  }>({
    x: 0,
    scale: 1,
  });
  // const [isDragging, setIsDragging] = useState(false);

  const style = useSpring({
    x: rawStyle.x,
    scale: rawStyle.scale,
    config: config,
  });

  const setStyle = useCallback((progress: number) => {
    setRawStyle({
      x: progress * -35,
      scale: 1 - progress * 0.25,
    });
  }, []);

  return {
    style,
    setStyle,
  };
};

export default useButtonStyle;
