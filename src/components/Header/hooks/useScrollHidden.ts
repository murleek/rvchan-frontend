import { useEffect, useState } from "react";

const useScrollHidden = (hideTitle: boolean) => {
  const [isTitleHidden, setIsTitleHidden] = useState(false);

  useEffect(() => {
    if (!hideTitle) return;

    const onScroll = () => {
      setIsTitleHidden(window.scrollY < 64);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideTitle]);

  return isTitleHidden;
};

export default useScrollHidden;
