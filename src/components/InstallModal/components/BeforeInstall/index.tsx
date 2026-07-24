import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "radix-ui";
import Logo from "@/assets/logo.svg?react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useTranslation } from "react-i18next";

const BeforeInstall = ({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) => {
  const { isStandalone, canInstall, installPWA } = usePwaInstall();
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
        <div className="flex flex-col justify-center gap-3 p-5 pt-8 pb-32 sm:pb-16 md:pb-20 overflow-auto">
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
        </div>

        <DialogFooter className="p-2 px-7 absolute w-full bottom-0 z-10 max-sm:flex-col">
          <Button
            className="rounded-full h-12 font-black text-md sm:flex-1 animated z-10"
            onClick={() => props.onOpenChange?.(false)}
            disabled={isStandalone || !canInstall}
            variant="destructive"
          >
            {t("before.cancel")}
          </Button>
          <Button
            className="rounded-full h-12 font-black text-md sm:flex-1 animated z-10"
            onClick={installPWA}
            disabled={isStandalone || !canInstall}
          >
            {isStandalone
              ? t("before.installed")
              : !canInstall
                ? t("before.cantInstall")
                : t("before.install")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BeforeInstall;
