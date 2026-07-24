import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Ellipsis, Share, SquarePlus } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import Logo from "@/assets/logo.svg?react";
import { Trans, useTranslation } from "react-i18next";

const SafariInstall = ({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) => {
  const { t } = useTranslation("pwa");
  return (
    <Dialog {...props}>
      <DialogContent
        className="p-0 overflow-hidden max-md:h-full"
        aria-describedby={undefined}
        onClose={() => props.onOpenChange?.(false)}
      >
        <div className="md:rounded-t-xl backdrop-blur-xs mask-b-from-40% mask-b-to-100% absolute left-0 top-0 bottom-0 pointer-events-none z-1 w-full h-8" />
        <div className="md:rounded-t-xl mask-b-from-10% mask-b-to-80% bg-background/80 absolute left-0 top-0 bottom-0 pointer-events-none z-1 w-full h-8 animated transition-colors" />
        <div className="flex flex-col items-stretch gap-3 p-5 pt-8 pb-16 overflow-auto">
          <div className="flex flex-col items-center gap-3">
            <Logo
              className="size-15 overflow-hidden rounded-2xl"
              style={
                {
                  cornerShape: "squircle",
                } as React.CSSProperties
              }
            />
            <div className="text-center">
              <h2 className="text-lg font-semibold">{t("title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <div className="my-5 rounded-xl bg-card p-4">
            <h3 className="mb-2 text-sm font-medium">
              {t("safari.howToInstall")}
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  1
                </span>
                <span className="inline-flex flex-wrap flex-1 items-center gap-x-1.5">
                  <Trans
                    t={t}
                    i18nKey="safari.instructions.1"
                    components={{
                      iconContainer: (
                        <div className="flex justify-center items-center rounded-full size-10 border font-medium text-foreground" />
                      ),
                      icon: <Ellipsis className="size-6" />,
                    }}
                  />
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  2
                </span>
                <span className="inline-flex flex-wrap flex-1 items-center gap-x-1.5">
                  <Trans
                    t={t}
                    i18nKey="safari.instructions.2"
                    values={{ share: t("safari.buttons.share") }}
                    components={{
                      iconContainer: (
                        <div className="flex items-center gap-2 rounded-lg h-8 w-fit border px-2 py-0.5 text-xs font-medium text-foreground relative top-0.5" />
                      ),
                      icon: <Share className="size-4" />,
                    }}
                  />
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  3
                </span>
                <span className="inline-flex flex-wrap flex-1 items-center gap-x-1.5">
                  <Trans
                    t={t}
                    i18nKey="safari.instructions.3"
                    values={{
                      addToHomeScreen: t("safari.buttons.addToHomeScreen"),
                    }}
                    components={{
                      iconContainer: (
                        <span className="inline-flex items-center gap-2 rounded-sm h-6 border px-2 py-0.5 flex-none text-xs font-medium text-foreground relative " />
                      ),
                      icon: <SquarePlus className="size-4" />,
                    }}
                  />
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  4
                </span>
                <span className="inline-flex flex-wrap flex-1 items-center gap-x-1.5">
                  <Trans
                    t={t}
                    i18nKey="safari.instructions.4"
                    values={{ add: t("safari.buttons.add") }}
                    components={{
                      iconContainer: (
                        <span className="inline-flex items-center gap-2 rounded-full h-6 highlight bg-blue-500 px-2 py-0.5 flex-none text-xs font-extrabold text-white/80 backdrop-brightness-110 relative top-px" />
                      ),
                    }}
                  />
                </span>
              </li>
            </ol>
          </div>
        </div>

        <DialogFooter className="p-2 px-7 absolute w-full bottom-0 z-10">
          <Button
            className="rounded-full h-12 font-black text-md w-full z-10"
            onClick={() => props.onOpenChange?.(false)}
          >
            {t("safari.ok")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SafariInstall;
