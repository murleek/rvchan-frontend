import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export const Unit = {
  YEAR: "year",
  MONTH: "month",
  WEEK: "week",
  DAY: "day",
  HOUR: "hour",
  MINUTE: "minute",
  SECOND: "second",
} as const;

export type Unit = (typeof Unit)[keyof typeof Unit];

const UNITS: { [K in Unit]: number } = {
  [Unit.YEAR]: 365.25 * 24 * 60 * 60,
  [Unit.MONTH]: (365.25 / 12) * 24 * 60 * 60,
  [Unit.WEEK]: 7 * 24 * 60 * 60,
  [Unit.DAY]: 24 * 60 * 60,
  [Unit.HOUR]: 60 * 60,
  [Unit.MINUTE]: 60,
  [Unit.SECOND]: 1,
} as const;

export const getRelativeTimeString = (
  target?: number | Date | string | null,
  units: Unit[] = [
    Unit.YEAR,
    Unit.MONTH,
    Unit.WEEK,
    Unit.DAY,
    Unit.HOUR,
    Unit.MINUTE,
  ],
): { t: string; params: Record<string, unknown> } => {
  if (target === "now") return { t: "now", params: {} };
  if (!target) return { t: "unknown", params: {} };
  const targetMs =
    target instanceof Date ? target.getTime() : new Date(target).getTime();
  const diffSec = Math.round((Date.now() - targetMs) / 1000);

  const absDiff = Math.abs(diffSec);

  for (const unit of Object.values(units)) {
    if (absDiff >= UNITS[unit]) {
      const count = Math.floor(diffSec / UNITS[unit]);
      return { t: `${unit}`, params: { count } };
    }
  }

  const firstUnit = units.sort((a, b) => UNITS[a] - UNITS[b])[0];

  return {
    t: firstUnit == Unit.SECOND ? "now" : firstUnit,
    params: { count: Math.floor(diffSec / UNITS[firstUnit]) },
  };
};

const getNextUpdateInterval = (diffSec: number): number => {
  const abs = Math.abs(diffSec);

  if (abs < 60) return 1000;
  if (abs < 3600) return 60000;
  if (abs < 86400) return 3600000;
  if (abs < 86400 * 7) return 86400000;
  return 86400000 * 7;
};

const useRelativeTime = (
  date?: Date | string | null,
  type: "short" | "long" = "short",
): string => {
  const { t } = useTranslation();

  const initial = useMemo(() => {
    return getRelativeTimeString(date);
  }, [date]);

  const [obj, setObj] = useState({
    t: `units.relative.${type}.${initial.t}`,
    params: initial.params,
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      if (!date) return;
      const now = Date.now();
      const targetMs = new Date(date).getTime();
      const diffSec = Math.round((targetMs - now) / 1000);

      const time = getRelativeTimeString(date);
      setObj({ t: `units.relative.${type}.${time.t}`, params: time.params });

      const delay = getNextUpdateInterval(diffSec);
      timer = setTimeout(tick, delay);
    };

    tick();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [date, type, t]);

  return t(obj.t, obj.params);
  // return JSON.stringify(obj);
};

export default useRelativeTime;
