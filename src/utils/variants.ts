type VariantsConfig = Record<string, Record<string, string>>;

export function variants<
  V extends VariantsConfig,
  D extends Partial<{ [K in keyof V]: keyof V[K] }>,
>(config: { base?: string; variants?: V; defaultVariants?: D }) {
  return (
    props?: Partial<{ [K in keyof V]: keyof V[K] }> & { className?: string },
  ) => {
    const classes = [config.base];

    if (config.variants) {
      for (const key in config.variants) {
        const value =
          props?.[key as keyof typeof props] ?? config.defaultVariants?.[key];

        if (value) {
          classes.push(config.variants[key][value as string]);
        }
      }
    }

    if (props?.className) classes.push(props.className);

    return classes.filter(Boolean).join(" ");
  };
}
