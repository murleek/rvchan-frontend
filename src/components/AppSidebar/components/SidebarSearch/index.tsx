import { useSearchUsersQuery } from "@/app/features/user/user.api";
import type { Profile } from "@/app/types/auth";
import Loader from "@/components/Common/Loader";
import ProfileAvatar from "@/components/Common/ProfileAvatar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { SidebarGroup, useSidebar } from "@/components/ui/sidebar";
import { PAGES } from "@/constants";
import { useDebounce } from "@uidotdev/usehooks";
import clsx from "clsx";
import { useEffect, useRef, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

type SidebarSearchProps = {};

const SidebarSearch: FC<SidebarSearchProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setOpenMobile, isMobile, open } = useSidebar();

  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const { data: searchResults, isFetching } = useSearchUsersQuery(
    debouncedQuery,
    {
      skip: debouncedQuery.trim() === "",
    },
  );

  const handleSelect = (user: Profile) => {
    navigate(PAGES.USER.replace(":username", user.username));
    inputRef.current?.blur();
    setOpenMobile(false);
  };

  useEffect(() => {
    if (!isMobile && !open) inputRef.current?.blur();
  }, [isMobile, open]);

  useEffect(() => {
    setResults(searchResults || []);
    setLoading(false);
  }, [searchResults, debouncedQuery]);

  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      setResults([]);
      setLoading(false);
    }
    if (debouncedQuery !== query) {
      setLoading(true);
    }
  }, [debouncedQuery, query]);

  return (
    <SidebarGroup
      className={clsx(
        "animated overflow-hidden h-12",
        !isMobile && !open && "h-0 py-0 pointer-none",
      )}
    >
      <Combobox items={results || searchResults} value={null} autoHighlight>
        <ComboboxInput
          placeholder={t("user.search.placeholder")}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          className={"bg-card"}
          ref={inputRef}
          value={query}
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {isLoading || isFetching ? (
              <div className="flex items-center gap-2">
                <Loader className="size-4!" /> {t("user.search.loading")}
              </div>
            ) : query.length > 0 ? (
              t("user.search.empty")
            ) : (
              t("user.search.emptyValue")
            )}
          </ComboboxEmpty>

          <ComboboxList>
            {(item) => (
              <ComboboxItem
                key={item}
                value={item}
                onClick={handleSelect.bind(null, item)}
              >
                <div className="flex gap-2">
                  <ProfileAvatar src={item.avatar} />
                  <div className="flex items-center justify-between w-full text-left">
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate text-sm/4 font-bold">
                        {item.firstName} {item.lastName}
                      </span>
                      <span className="truncate text-xs animated text-black/50 dark:text-white/50">
                        @{item.username}
                      </span>
                    </div>
                  </div>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </SidebarGroup>
  );
};

export default SidebarSearch;
