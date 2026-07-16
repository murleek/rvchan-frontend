import { useSpringValue, type SpringConfig } from "@react-spring/web";

const useNavButtonTextStyle = (config: SpringConfig) => {
  const fontSize = useSpringValue(12, { config });
  const opacity = useSpringValue(1, { config });

  const setStyle = (progress: number) => {
    fontSize.start(12 * (1 - progress));
    opacity.start(1 - progress);
  };

  return {
    style: { fontSize, opacity },
    setStyle,
  };
};

export default useNavButtonTextStyle;
