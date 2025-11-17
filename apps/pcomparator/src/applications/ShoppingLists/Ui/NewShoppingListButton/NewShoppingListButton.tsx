"use client";

import { Button, Tooltip } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export const NewShoppingListButton = () => (
  <div className="fixed bottom-24 right-6 z-50">
    <Tooltip content="Create a new shopping list" placement="top">
      <Link href="/shopping-lists/create">
        <Button
          size="lg"
          color="primary"
          variant="solid"
          className="shadow-lg hover:shadow-xl transition-shadow"
        >
          <PlusIcon size={18} />
          <Trans>New List</Trans>
        </Button>
      </Link>
    </Tooltip>
  </div>
);
