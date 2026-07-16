import { useSpringValue, type SpringConfig } from "@react-spring/web";

const useNavCardStyle = (config: SpringConfig) => {
  const x = useSpringValue(0, { config });
  const padding = useSpringValue(8, { config });

  const setStyle = (progress: number) => {
    x.start(progress * 35);
    padding.start(8 - progress * 6);
  };

  return {
    style: { x, paddingLeft: padding, paddingRight: padding },
    setStyle,
  };
};

export default useNavCardStyle;
