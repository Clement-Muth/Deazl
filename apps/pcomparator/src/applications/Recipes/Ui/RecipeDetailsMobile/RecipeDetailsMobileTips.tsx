"use client";

import { Card, CardBody } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { motion } from "framer-motion";

interface Tip {
  id: string;
  title?: string | null;
  content: string;
}

interface RecipeDetailsMobileTipsProps {
  tips: Tip[];
}

export default function RecipeDetailsMobileTips({ tips }: RecipeDetailsMobileTipsProps) {
  if (tips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card>
        <CardBody className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            <Trans>Tips & Advice</Trans>
          </h3>
          <div className="space-y-2">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className="p-3 bg-blue-50 dark:bg-blue-900/10 border-l-3 border-blue-500 rounded-r-lg"
              >
                {tip.title && (
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">{tip.title}</p>
                )}
                <p className="text-xs text-gray-700 dark:text-gray-300">{tip.content}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
