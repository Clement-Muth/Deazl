"use client";

import { Button } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { motion } from "framer-motion";
import { ChefHat, Home, RotateCcw } from "lucide-react";

interface CookingCompletionScreenProps {
  recipeName: string;
  totalSteps: number;
  onFinish: () => void;
  onRestart: () => void;
}

export function CookingCompletionScreen({
  recipeName,
  totalSteps,
  onFinish,
  onRestart
}: CookingCompletionScreenProps) {
  return (
    <div className="h-full flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          duration: 0.6
        }}
        style={{ maxWidth: "42rem", width: "100%" }}
      >
        <div className="bg-gradient-to-br from-success-50 to-primary-50 dark:from-success-900/20 dark:to-primary-900/20 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.2
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "6rem",
                height: "6rem",
                borderRadius: "9999px",
                backgroundColor: "hsl(var(--success))",
                color: "white",
                marginBottom: "1rem"
              }}
            >
              <ChefHat size={48} />
            </motion.div>
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                <Trans>Recipe Completed!</Trans>
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
                <Trans>Congratulations! You have successfully completed</Trans>
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-2xl font-semibold text-primary mb-6">{recipeName}</p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-1">{totalSteps}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <Trans>Steps Completed</Trans>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-1">🎉</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <Trans>Well Done</Trans>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                color="primary"
                variant="shadow"
                onPress={onFinish}
                startContent={<Home size={20} />}
                className="min-w-48 text-lg font-semibold"
              >
                <Trans>Back to Recipe</Trans>
              </Button>

              <Button
                size="lg"
                variant="bordered"
                onPress={onRestart}
                startContent={<RotateCcw size={20} />}
                className="min-w-48 text-lg font-semibold"
              >
                <Trans>Cook Again</Trans>
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
              <Trans>Enjoy your meal!</Trans>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
