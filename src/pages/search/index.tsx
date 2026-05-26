import { useSearchUsersQuery } from "@/app/features/user/user.api";
import type { ShortProfile } from "@/app/types/auth";
import Loader from "@/components/Common/Loader";
import ProfileAvatar from "@/components/Common/ProfileAvatar";
import { PAGES } from "@/constants";
import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { useHeader } from "@/hooks/common/useHeader";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";
import BigHeader from "@/components/Header/components/BigHeader";

const SearchPage = () => {
  const { t } = useTranslation("search");
  useHeader(t("header"), { hideTitle: true });
  const [params, setParams] = useSearchParams();

  const initQuery = useMemo(() => {
    return params.get("q") || "";
  }, [params]);

  const [query, setQuery] = useState(initQuery);
  const debouncedQuery = useDebounce(query, 300);

  const { data: results = [], isFetching } = useSearchUsersQuery(
    debouncedQuery,
    {
      skip: debouncedQuery.trim() === "",
    },
  );

  useEffect(() => {
    setParams(
      query.trim() === "" ? undefined : ({ q: query } as { q: string }),
      {
        replace: true,
      },
    );
  }, [query, debouncedQuery, setParams]);

  return (
    <div>
      <BigHeader>{t("header")}</BigHeader>

      <InputGroup className="bg-card border-0 rounded-full px-2 h-10 w-full active:scale-105 animated transition-[scale,color,background] shadow-lg inset-shadow-glow dark:inset-shadow-white/20">
        <InputGroupInput
          id="input-group-url"
          placeholder={t("placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>

      <div className="mt-4 flex flex-col gap-2">
        {isFetching ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader className="size-4!" />
            {t("loading")}
          </div>
        ) : query.trim() === "" ? (
          <p className="text-sm text-center text-muted-foreground">
            {t("empty.query")}
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground">
            {t("empty.results", { query: debouncedQuery })}
          </p>
        ) : (
          results.map((item: ShortProfile) => (
            <Link
              key={item.id}
              to={PAGES.USER.replace(":username", item.username)}
            >
              <Card className="flex-row gap-4 p-3 hover:bg-black/8 dark:hover:bg-white/8 cursor-pointer">
                <ProfileAvatar src={item.avatar} />

                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-semibold truncate">
                    {item.firstName} {item.lastName}
                  </span>

                  <span className="text-xs text-muted-foreground truncate">
                    @{item.username}
                  </span>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchPage;
