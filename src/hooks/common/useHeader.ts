import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import {
  setHideTitle,
  setIsClickable,
  setTitle,
} from "@/app/features/header/header.slice";

const useHeader = (
  title?: string | null,
  {
    hideTitle = false,
    onClick,
    isClickable = false,
  }: { hideTitle?: boolean; onClick?: () => void; isClickable?: boolean } = {},
) => {
  const dispatch = useDispatch();

  const onClickRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    onClickRef.current = onClick ?? null;
  });

  useEffect(() => {
    if (title === undefined) return;
    dispatch(setTitle(title));
    dispatch(setHideTitle(hideTitle));
    dispatch(setIsClickable(isClickable));
  }, [dispatch, title, hideTitle, isClickable]);

  return {
    onClickRef,
    setTitle: useCallback(
      (v: string | null) => dispatch(setTitle(v)),
      [dispatch],
    ),
    setHideTitle: useCallback(
      (v: boolean) => dispatch(setHideTitle(v)),
      [dispatch],
    ),
    setIsClickable: useCallback(
      (v: boolean) => dispatch(setIsClickable(v)),
      [dispatch],
    ),
  };
};

const useHeaderSelector = () => useSelector((state: RootState) => state.header);

export { useHeader, useHeaderSelector };
