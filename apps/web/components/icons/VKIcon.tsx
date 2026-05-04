import type { SVGProps } from "react";

export function VKIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M13.16 18.18c-7.05 0-11.07-4.83-11.24-12.86h3.53c.12 5.9 2.72 8.4 4.78 8.92V5.32h3.32v5.08c2.04-.22 4.18-2.55 4.9-5.08h3.32c-.55 3.13-2.88 5.46-4.54 6.42 1.66.78 4.32 2.81 5.33 6.44h-3.65c-.79-2.46-2.74-4.36-5.36-4.62v4.62z" />
    </svg>
  );
}
