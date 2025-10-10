"use client";

import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = AnchorHTMLAttributes<HTMLAnchorElement>;

export function SkipNavLink({ className, ...props }: Props) {
  return (
    <a
      className={cn(
        "sr-only sr-only-focusable focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
}
