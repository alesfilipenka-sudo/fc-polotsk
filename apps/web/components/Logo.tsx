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
 * White-tinted logo (solid silhouette via CSS mask). Used on dark backgrounds
 * where a flat white shape is desired — e.g. small header / footer brand.
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

interface LogoDecorProps {
  size?: number;
  className?: string;
  opacity?: number;
}

/**
 * Decorative full-color logo for background corners (next match card,
 * footer, news placeholders, hero bg). Renders the real PNG with low
 * opacity so blue parts of the crest blend with the block's blue
 * background — keeps the boat / club name visible instead of collapsing
 * to a flat silhouette.
 */
export function LogoDecor({
  size = 300,
  className,
  opacity = 0.08,
}: LogoDecorProps) {
  return (
    <img
      src="/logo.png"
      alt=""
      aria-hidden
      draggable={false}
      className={cn("pointer-events-none select-none object-contain", className)}
      style={{ width: size, height: size, opacity }}
    />
  );
}
