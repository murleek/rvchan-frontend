import { useSpring, type SpringConfig } from "@react-spring/web";
import { useCallback, useState } from "react";

const useNavbarScrollProgress = (
  config: SpringConfig,
  isPostFormShown: boolean,
) => {
  const [rawStyle, setRawStyle] = useState<{
    y: number;
  }>({
    y: 0,
  });
  // const [isDragging, setIsDragging] = useState(false);

  const style = useSpring({
    y: isPostFormShown ? rawStyle.y : 48,
    opacity: isPostFormShown ? 1 : 0,
    scale: isPostFormShown ? 1 : 0.5,
    filter: `blur(${isPostFormShown ? 0 : 10}px)`,
    config: config,
  });

  const setStyle = useCallback((progress: number) => {
    setRawStyle({
      y: progress * 10.3,
    });
  }, []);

  return {
    style,
    setStyle,
  };
};

export default useNavbarScrollProgress;
