import { useSpringValue, type SpringConfig } from "@react-spring/web";
import { useEffect } from "react";

const useNavbarScrollProgress = (
  config: SpringConfig,
  isPostFormShown: boolean,
) => {
  const y = useSpringValue<number>(0, { config, immediate: true });
  const opacity = useSpringValue<number>(isPostFormShown ? 1 : 0, {
    config,
    immediate: true,
  });
  const scaleX = useSpringValue<number>(isPostFormShown ? 1 : 0.5, {
    config,
    immediate: true,
  });
  const scaleY = useSpringValue<number>(isPostFormShown ? 1 : 0.75, {
    config,
    immediate: true,
  });
  const filter = useSpringValue<string>(`blur(${isPostFormShown ? 0 : 10}px)`, {
    config,
    immediate: true,
  });

  const setStyle = (progress: number) => {
    if (isPostFormShown) {
      y.start(progress * 10.3);
    }
  };

  useEffect(() => {
    if (isPostFormShown) {
      opacity.start(1);
      scaleX.start(1);
      scaleY.start(1);
      filter.start(`blur(0px)`);
      y.start(0);
    } else {
      opacity.start(0);
      scaleX.start(0.3333);
      scaleY.start(0.75);
      filter.start(`blur(10px)`);
      y.start(64);
    }
  }, [isPostFormShown, opacity, y, scaleX, scaleY, filter]);

  return {
    style: { y, opacity, scaleX, scaleY, filter },
    setStyle,
  };
};

export default useNavbarScrollProgress;
