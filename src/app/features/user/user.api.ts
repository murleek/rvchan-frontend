import { createApi } from "@reduxjs/toolkit/query/react";
import type {
  Device,
  Profile,
  ShortProfile,
  User,
  UserAgent,
} from "@/app/types/auth";
import { axiosBaseQuery, baseQueryWithReauth } from "../../baseQuery";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getDevices: builder.query<Device[], void>({
      query: () => "/user/devices",
      providesTags: ["User"],
      transformResponse: (response: Device[]) =>
        response.map((device) => ({
          ...device,
          userAgent: device.userAgent
            ? (Object.fromEntries(
                Object.entries(device.userAgent).map(([key, value]) => [
                  key,
                  value === "unknown" ? null : value,
                ]),
              ) as UserAgent)
            : device.userAgent,
        })),
    }),
    logoutDevice: builder.mutation<void, string>({
      query: (deviceId) => ({
        url: "/user/devices",
        method: "DELETE",
        body: { deviceId },
      }),
      invalidatesTags: ["User"],
    }),
    checkUsername: builder.query<
      { available: boolean; message?: string },
      string
    >({
      query: (username) => ({
        url: "/user/check-username?username=" + encodeURIComponent(username),
        method: "POST",
        body: { username },
      }),
    }),
    initUser: builder.mutation<
      void,
      {
        firstName: string;
        username: string;
        lastName: string | null;
        description: string | null;
      }
    >({
      query: (data) => ({
        url: "/user/init",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    getUserByUsername: builder.query<User, string>({
      query: (username) =>
        "/user/get-user?username=" + encodeURIComponent(username),
      providesTags: ["User"],
    }),

    searchUsers: builder.query<ShortProfile[], string>({
      query: (query) => "/user/search?q=" + encodeURIComponent(query),
      providesTags: ["User"],
    }),
    me: builder.query<Profile, void>({
      query: () => "/user/profile",
      providesTags: ["User"],
    }),
    editProfile: builder.mutation<
      void,
      {
        firstName?: string;
        username?: string;
        lastName?: string;
        description?: string;
        isPrivate?: boolean;
      }
    >({
      query: (data) => ({
        url: "/user/profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const userUploadApi = createApi({
  reducerPath: "userUploadApi",
  baseQuery: axiosBaseQuery,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    uploadAvatar: builder.mutation<
      { id: string; hash: string },
      {
        data: FormData;
        onProgress: (progressEvent: number) => void;
      }
    >({
      query: ({ data, onProgress }) => ({
        url: "/user/avatar/upload",
        method: "POST",
        data,
        onUploadProgress: onProgress,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useMeQuery,
  useLogoutDeviceMutation,
  useGetDevicesQuery,
  useLazyCheckUsernameQuery,
  useInitUserMutation,
  useGetUserByUsernameQuery,
  useSearchUsersQuery,
  useEditProfileMutation,
} = userApi;

export const { useUploadAvatarMutation } = userUploadApi;
