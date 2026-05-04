import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Standard logo on a light background. Uses next/image for optimization.
 */
export function Logo({ size = 32, className, priority }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="ФК Полоцк"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}

interface LogoLightProps {
  size?: number;
  className?: string;
  opacity?: number;
}

/**
 * White-tinted logo for use on dark backgrounds. Uses CSS mask-image so the
 * single PNG asset works on either theme without a second file.
 */
export function LogoLight({ size = 32, className, opacity = 1 }: LogoLightProps) {
  return (
    <span
      aria-label="ФК Полоцк"
      role="img"
      className={cn("inline-block bg-white", className)}
      style={{
        width: size,
        height: size,
        opacity,
        WebkitMaskImage: "url(/logo.png)",
        maskImage: "url(/logo.png)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
