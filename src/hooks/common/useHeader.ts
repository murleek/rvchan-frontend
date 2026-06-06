import { useCallback, useEffect, useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import {
  setHideTitle,
  setIsClickable,
  setTitle,
  setHasClick,
} from "@/app/features/header/header.slice";

export const onClickRef = {
  current: null as (() => void) | null,
};

const useHeader = (
  title?: string | null,
  {
    hideTitle = false,
    onClick,
    isClickable = false,
  }: { hideTitle?: boolean; onClick?: () => void; isClickable?: boolean } = {},
) => {
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    onClickRef.current = onClick ?? null;
    dispatch(setHasClick(!!onClick));
  });

  useEffect(() => {
    if (title === undefined) return;
    dispatch(setTitle(title));
    dispatch(setHideTitle(hideTitle));
    dispatch(setIsClickable(isClickable));
    dispatch(setHasClick(!!onClick));
  }, [dispatch, title, hideTitle, isClickable, onClick]);

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
    setHasClick: useCallback(
      (v: boolean) => dispatch(setHasClick(v)),
      [dispatch],
    ),
  };
};

const useHeaderSelector = () => useSelector((state: RootState) => state.header);

export { useHeader, useHeaderSelector };
