"use client";

import { Link as LinkNextUi, type LinkProps as LinkNextUiProps } from "@heroui/link";
import clsx from "clsx";
import LinkNext from "next/link";
import { type ReactNode, forwardRef } from "react";

export interface LinkProps extends LinkNextUiProps {
  children: ReactNode;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ children, ...props }, ref) => {
  return (
    <LinkNextUi
      as={LinkNext}
      color="foreground"
      {...props}
      ref={ref}
      className={clsx("[&>svg]:inline", props.className)}
    >
      {children}
    </LinkNextUi>
  );
});

export default Link;
