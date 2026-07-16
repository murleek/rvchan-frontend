import { useSpring, type SpringConfig } from "@react-spring/web";
import { useCallback, useState } from "react";

const useNavCardStyle = (config: SpringConfig) => {
  const [x, setX] = useState<number>(0);
  const [padding, setPadding] = useState<number>(8);
  // const [isDragging, setIsDragging] = useState(false);

  const style = useSpring({
    x,
    paddingLeft: padding,
    paddingRight: padding,
    config: config,
  });

  const setStyle = useCallback((progress: number) => {
    setX(progress * 35);
    setPadding(8 - progress * 6);
  }, []);

  return {
    style,
    setStyle,
  };
};

export default useNavCardStyle;
