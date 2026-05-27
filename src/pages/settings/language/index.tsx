import BigHeader from "@/components/Header/components/BigHeader";
import { Card } from "@/components/ui/card";
import { useHeader } from "@/hooks/common/useHeader";
import clsx from "clsx";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const languages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
  },
];

const LanguageButton = ({
  name,
  nativeName,
  isActive,
  onClick,
}: {
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center justify-between px-4 py-2 text-left hover:bg-muted animated"
      }
    >
      <div className="flex flex-col gap-0">
        <span className="font-bold">{name}</span>
        <span className="text-xs">{nativeName}</span>
      </div>
      <Check
        className={clsx(
          "text-primary animated transition-opacity size-4 opacity-0",
          isActive && "opacity-100",
        )}
      />
    </button>
  );
};

const SettingsLanguagePage = () => {
  const { t, i18n } = useTranslation("settings");
  useHeader(t("language.header"), { hideTitle: true });
  const detectedLanguage = i18n.services.languageDetector.detect();

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const lngs = languages
    .filter(
      (lang) =>
        lang.code === detectedLanguage?.[1] ||
        (!detectedLanguage?.[2].startsWith("en") &&
          detectedLanguage?.[2].startsWith(lang.code)),
    )
    .sort((a, b) => {
      if (a.code === detectedLanguage?.[1]) return -1;
      if (b.code === detectedLanguage?.[1]) return 1;
      if (
        !detectedLanguage?.[2].startsWith("en") &&
        detectedLanguage?.[2].startsWith(a.code)
      )
        return -1;
      if (
        !detectedLanguage?.[2].startsWith("en") &&
        detectedLanguage?.[2].startsWith(b.code)
      )
        return 1;
      return 0;
    });

  return (
    <div className="flex flex-col">
      <BigHeader>{t("language.header")}</BigHeader>
      <div className="flex flex-col gap-3">
        <Card className="p-0 flex flex-col gap-0 overflow-hidden">
          {lngs.map((lang) => (
            <LanguageButton
              key={lang.code}
              code={lang.code}
              name={lang.name}
              nativeName={lang.nativeName}
              isActive={i18n.language === lang.code}
              onClick={() => handleLanguageChange(lang.code)}
            />
          ))}
        </Card>
        <Card className="p-0 flex flex-col gap-0 overflow-hidden">
          {languages
            .filter(
              (lang) =>
                !(
                  lang.code === detectedLanguage?.[1] ||
                  (!detectedLanguage?.[2].startsWith("en") &&
                    detectedLanguage?.[2].startsWith(lang.code))
                ),
            )
            .map((lang) => (
              <LanguageButton
                key={lang.code}
                code={lang.code}
                name={lang.name}
                nativeName={lang.nativeName}
                isActive={i18n.language === lang.code}
                onClick={() => handleLanguageChange(lang.code)}
              />
            ))}
        </Card>
      </div>
    </div>
  );
};

export default SettingsLanguagePage;
