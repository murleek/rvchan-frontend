import { useSpring, type SpringConfig } from "@react-spring/web";
import { useCallback, useState } from "react";

const useNavButtonTextStyle = (config: SpringConfig) => {
  const [rawStyle, setRawStyle] = useState<{
    fontSize: number;
    opacity: number;
  }>({
    fontSize: 12,
    opacity: 1,
  });
  // const [isDragging, setIsDragging] = useState(false);

  const style = useSpring({
    fontSize: rawStyle.fontSize,
    opacity: rawStyle.opacity,
    config: config,
  });

  const setStyle = useCallback((progress: number) => {
    setRawStyle({
      fontSize: 12 * (1 - progress),
      opacity: 1 - progress,
    });
  }, []);

  return {
    style,
    setStyle,
  };
};

export default useNavButtonTextStyle;
