import {
  useFollowMutation,
  useUnfollowMutation,
} from "@/app/features/relationship/relationship.api";
import { useGetUserByUsernameQuery } from "@/app/features/user/user.api";
import ErrorView from "@/components/Common/ErrorView";
import Loader from "@/components/Common/Loader";
import ProfileAvatar from "@/components/Common/ProfileAvatar";
import { useHeader } from "@/hooks/common/useHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import clsx from "clsx";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import PostForm from "@/components/Common/PostForm";
import UserThread from "@/components/Common/UserThread";
import useRelativeTime from "@/hooks/useRelativeTime";
import { PAGES } from "@/constants";

const ProfilePage = () => {
  const { t } = useTranslation("profile");
  const { setTitle, setHideTitle } = useHeader(t("header.profile"), {
    hideTitle: true,
  });
  const { username } = useParams();
  const {
    data: loadedProfile,
    isFetching,
    isLoading,
    error,
    refetch,
  } = useGetUserByUsernameQuery(username!, {
    skip: !username,
  });

  const time = useRelativeTime(loadedProfile?.lastActiveAt, "long");

  const [follow, { isLoading: isFollowing }] = useFollowMutation();
  const [unfollow, { isLoading: isUnfollowing }] = useUnfollowMutation();

  const handleFollow = async () => {
    if (!loadedProfile) return;

    if (loadedProfile.isFollowing) {
      await unfollow(loadedProfile.id);
    } else {
      await follow(loadedProfile.id);
    }

    await refetch();
  };

  useEffect(() => {
    if (loadedProfile) {
      if (loadedProfile.isMine) {
        setTitle(t("header.my_profile"));
        setHideTitle(false);
      } else {
        setTitle(`${loadedProfile.firstName} ${loadedProfile.lastName}`);
        setHideTitle(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedProfile]);

  if (isLoading)
    return (
      <Card className="md:px-4 gap-2 h-40 justify-center items-center">
        <Loader className="text-fuchsia-500 size-10!" />
        <span className="text-center text-muted-foreground animated transition-colors block">
          {t("loading")}
        </span>
      </Card>
    );

  if (error || !loadedProfile) return <ErrorView t="notFound" noReload />;

  return (
    <div>
      <Card className="w-full mb-4 p-6 gap-4">
        <div className="flex items-center justify-between">
          <div className="">
            <h1 className="text-3xl font-black">
              {loadedProfile.firstName} {loadedProfile.lastName}
            </h1>
            <span className="text-muted-foreground animated transition-colors block">
              @{loadedProfile.username}
            </span>
            <span className="block mt-2">{loadedProfile.description}</span>
          </div>
          <div className="relative">
            <ProfileAvatar
              className="size-24 rounded-full"
              src={loadedProfile.avatar}
            />
            <span
              className={clsx(
                "absolute right-0.5 bottom-0.5 size-6 scale-75 ring-4 ring-card animated flex items-center justify-center rounded-full font-black text-[10px]",
                loadedProfile.lastActiveAt === "now"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted border text-black",
              )}
            ></span>
          </div>
        </div>

        <span className="flex gap-3 text-sm text-muted-foreground">
          {/* <button className="hover:underline! hover:cursor-pointer">
            <Trans
              ns="profile"
              i18nKey="friends"
              defaults="<b>{{count}}</b> friends"
              values={{ count: loadedProfile.friends ?? 0 }}
              components={{ b: <strong /> }}
            />
          </button> */}
          <Link
            to={PAGES.USER_FOLLOWERS.replace(
              ":username",
              loadedProfile.username,
            )}
            className="hover:underline! hover:cursor-pointer"
          >
            <Trans
              ns="profile"
              i18nKey="followers"
              values={{ count: loadedProfile.followers ?? 0 }}
              components={{ b: <strong /> }}
            />
          </Link>
          <Link
            to={PAGES.USER_FOLLOWING.replace(
              ":username",
              loadedProfile.username,
            )}
            className="hover:underline! hover:cursor-pointer"
          >
            <Trans
              ns="profile"
              i18nKey="following"
              values={{ count: loadedProfile.following ?? 0 }}
              components={{ b: <strong /> }}
            />
          </Link>
          <span className="ml-auto text-xs/3 min-w-24 text-center text-muted-foreground">
            {loadedProfile.lastActiveAt !== "now"
              ? // `был(а) ${time[0] && `${Math.floor(time[0])} `}${time[1]}`
                t("online.last_seen", { timeAgo: time })
              : t("online.now")}
          </span>
        </span>

        {!loadedProfile.isMine && (
          <div className="flex flex-1 gap-4">
            <Button
              variant={
                loadedProfile.isFollowed || loadedProfile.isFollowing
                  ? "secondary"
                  : "default"
              }
              onClick={handleFollow}
              disabled={isFollowing || isUnfollowing || isFetching}
              className="flex-1 cursor-pointer"
            >
              {t(
                loadedProfile.isFollowing && loadedProfile.isFollowed
                  ? "remove_friend"
                  : loadedProfile.isFollowing
                    ? "unfollow"
                    : loadedProfile.isFollowed
                      ? "accept_request"
                      : "follow",
              )}
            </Button>
          </div>
        )}
      </Card>

      <UserThread profile={loadedProfile} />
      {loadedProfile.isMine && (
        <PostForm
          className="sticky bottom-20 md:bottom-5 shadow-lg"
          username={loadedProfile.username}
        />
      )}
    </div>
  );
};

export default ProfilePage;
