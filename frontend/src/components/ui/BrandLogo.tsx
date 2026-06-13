import type { SVGProps } from "react";

export function BrandLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path
        d="M4 4h10.5l3.5 24L28 4h-8.5l-2 14.5L14.5 4H4z"
        fill="currentColor"
      />
    </svg>
  );
}
