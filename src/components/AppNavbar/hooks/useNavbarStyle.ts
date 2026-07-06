import { useSpring, type SpringConfig } from "@react-spring/web";
import { useCallback, useState } from "react";

const useNavbarScrollProgress = (config: SpringConfig) => {
  const [rawStyle, setRawStyle] = useState<{
    y: number;
    scale: number;
  }>({
    y: 0,
    scale: 1,
  });
  // const [isDragging, setIsDragging] = useState(false);

  const style = useSpring({
    y: rawStyle.y,
    scale: rawStyle.scale,
    config: config,
  });

  const setStyle = useCallback((progress: number) => {
    setRawStyle({
      y: progress * 4,
      scale: 1 - progress * 0.15,
    });
  }, []);

  return {
    style,
    setStyle,
  };
};

export default useNavbarScrollProgress;
