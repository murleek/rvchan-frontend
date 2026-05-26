import { useMedia } from "@/hooks/common/useMedia";

const ImageCdn = ({
  src,
  ...rest
}: { src: string } & React.ImgHTMLAttributes<HTMLImageElement>) => {
  const { url } = useMedia(src);
  return <img src={url || undefined} {...rest} />;
};

export default ImageCdn;
