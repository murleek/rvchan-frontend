// hooks/useFileUrl.ts
import { useGetURLQuery } from "@/app/features/media/media.api";
import { useMemo } from "react";

const cache = new Set<string>();

export function preloadImage(src: string, timeout = 10000): Promise<void> {
  if (cache.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();

    const timer = setTimeout(() => {
      reject(new Error("Image preload timeout"));
    }, timeout);

    img.src = src;

    img.onload = () => {
      clearTimeout(timer);
      cache.add(src);
      resolve();
    };

    img.onerror = (err) => {
      clearTimeout(timer);
      reject(err);
    };
  });
}

export function useMedia(id?: string, size: 1024 | 512 | 128 | 32 = 1024) {
  const query = useGetURLQuery(
    { fileId: id!, size },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    },
  );

  const { data, isLoading, isFetching, error, refetch } = query;

  const url = useMemo(() => data ?? null, [data]);

  return {
    url: id ? url : null,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
