import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../baseQuery";
import { preloadImage } from "@/hooks/common/useMedia";

export const mediaApi = createApi({
  reducerPath: "mediaApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["media"],
  endpoints: (builder) => ({
    upload: builder.mutation<{ id: string; hash: string }, FormData>({
      query: (data) => ({
        url: "/media/upload",
        method: "POST",
        body: data,
      }),
    }),
    getURL: builder.query<
      string,
      { fileId: string; size: 1024 | 512 | 128 | 32 }
    >({
      async queryFn(arg, _queryApi, _extraOptions, baseQuery) {
        const res = await baseQuery({
          url: `/media/file/${arg.fileId}`,
          params: arg.size ? { size: arg.size } : undefined,
          responseHandler: (res) => res.text(),
        });

        if (res.error) return { error: res.error };

        const url = res.data as string;

        await preloadImage(url);

        return { data: url };
      },

      serializeQueryArgs: ({ queryArgs }) =>
        `${queryArgs.fileId}-${queryArgs.size ?? "default"}`,
    }),
  }),
});

export const { useUploadMutation, useGetURLQuery } = mediaApi;
