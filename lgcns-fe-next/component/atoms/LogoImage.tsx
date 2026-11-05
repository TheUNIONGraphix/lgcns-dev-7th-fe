import { twMerge } from "tailwind-merge";

export default function LogoImage({
  src,
  alt,
  width,
  height,
  priority,
  className,
  ...props
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority: boolean;
  className?: string | undefined;
  props?: React.ImgHTMLAttributes<HTMLImageElement> | undefined;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={twMerge("w-full h-full object-cover", className)}
      {...props}
    />
  );
}
