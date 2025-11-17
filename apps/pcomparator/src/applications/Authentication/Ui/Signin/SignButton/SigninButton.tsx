"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import Link from "next/link";

export const SigninButton = () => (
  <Button as={Link} href={"/auth/signin"} color="primary" variant="flat" type="submit">
    <Trans>Signin</Trans>
  </Button>
);
