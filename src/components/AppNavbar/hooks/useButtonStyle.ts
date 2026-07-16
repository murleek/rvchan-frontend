import { useSpringValue, type SpringConfig } from "@react-spring/web";

const useButtonStyle = (config: SpringConfig) => {
  const x = useSpringValue(0, { config });
  const scale = useSpringValue(1, { config });

  const setStyle = (progress: number) => {
    x.start(progress * -35);
    scale.start(1 - progress * 0.25);
  };

  return {
    style: { x, scale },
    setStyle,
  };
};

export default useButtonStyle;
