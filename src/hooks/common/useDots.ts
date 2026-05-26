import { useEffect, useState } from "react";

const useDots = (): string => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev === "..." ? "" : prev + "."));
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return dots;
};

export default useDots;
