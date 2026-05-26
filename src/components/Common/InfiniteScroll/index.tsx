import React, { useCallback, useEffect, useRef } from "react";
import Loader from "../Loader";
import clsx from "clsx";

type InfiniteScrollProps = {
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isFetching?: boolean;
  children: React.ReactNode;
};

const InfiniteScroll = ({
  loadMore,
  hasMore,
  children,
  isFetching = false,
  className,
}: InfiniteScrollProps & React.HTMLAttributes<HTMLDivElement>) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(isFetching);

  // Keep ref in sync so the observer callback always sees the latest value
  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isFetchingRef.current) {
        loadMore();
      }
    },
    [hasMore, loadMore],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "0px 0px 800px 0px",
      threshold: 0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className={clsx("w-full", className)}>
      {children}

      {/* Sentinel element — sits just below the last item */}
      <div ref={sentinelRef} aria-hidden="true" />

      {hasMore && (
        <div className="flex justify-center py-4 w-full text-fuchsia-500">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
