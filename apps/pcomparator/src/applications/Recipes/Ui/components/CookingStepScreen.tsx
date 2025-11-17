"use client";

import { Button, Card } from "@heroui/react";
import { Trans } from "@lingui/react/macro";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Hand,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { useAlarm } from "../hooks/useAlarm";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { formatTime } from "../hooks/useTimer";

interface CookingStepScreenProps {
  step: {
    id: string;
    description: string;
    duration?: number;
  };
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
}

export function CookingStepScreen({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onPrevious
}: CookingStepScreenProps) {
  const { isSupported: isSpeechSupported, isSpeaking, speak, stop } = useSpeechSynthesis();
  const { isAlarmPlaying, stopAlarm, timer } = useAlarm(step);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  useEffect(() => {
    const hasSeenHint = localStorage.getItem("cookingSwipeHintSeen");
    if (hasSeenHint) {
      setShowSwipeHint(false);
    } else {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem("cookingSwipeHintSeen", "true");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSwipeLeft = () => {
    if (showSwipeHint) {
      setShowSwipeHint(false);
      localStorage.setItem("cookingSwipeHintSeen", "true");
    }
    onNext();
  };

  const handleSwipeRight = () => {
    if (showSwipeHint) {
      setShowSwipeHint(false);
      localStorage.setItem("cookingSwipeHintSeen", "true");
    }
    if (stepNumber > 1) {
      onPrevious();
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    trackMouse: true,
    trackTouch: true,
    delta: 50,
    preventScrollOnSwipe: true
  });

  const handleSpeech = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(step.description);
    }
  };

  return (
    <div {...handlers} className="touch-pan-y cursor-grab active:cursor-grabbing select-none relative">
      <AnimatePresence>
        {showSwipeHint && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-black/80 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl">
                <motion.div
                  animate={{ x: [-8, 8, -8] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
                >
                  <Hand size={24} className="text-white" />
                </motion.div>
                <div className="flex items-center gap-2">
                  <ChevronLeft size={20} className="text-white/70" />
                  <span className="text-white font-medium text-sm whitespace-nowrap">
                    <Trans>Swipe to navigate</Trans>
                  </span>
                  <ChevronRight size={20} className="text-white/70" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 }
        }}
      >
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg relative overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <p className="text-xl md:text-2xl font-medium break-words leading-relaxed text-gray-900 dark:text-gray-100">
                  {step.description}
                </p>
              </div>

              {isSpeechSupported && (
                <Button
                  isIconOnly
                  variant="light"
                  onPress={handleSpeech}
                  size="lg"
                  color={isSpeaking ? "primary" : "default"}
                  className="ml-4"
                >
                  {isSpeaking ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </Button>
              )}
            </div>

            {step.duration && (
              <div className="mt-6">
                <div
                  className={`flex items-center justify-center py-10 px-6 rounded-2xl transition-colors ${
                    timer.isFinished
                      ? "bg-success-50 dark:bg-success-900/20"
                      : timer.isRunning
                        ? "bg-primary-50 dark:bg-primary-900/20"
                        : "bg-gray-100 dark:bg-gray-700"
                  }`}
                >
                  <div className="text-center w-full">
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <Clock
                        className={
                          timer.isFinished
                            ? "text-success"
                            : timer.isRunning
                              ? "text-primary"
                              : "text-gray-500 dark:text-gray-400"
                        }
                        size={28}
                      />
                      <div
                        className={`text-6xl font-bold ${
                          timer.isFinished
                            ? "text-success"
                            : timer.isRunning
                              ? "text-primary"
                              : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {timer.isFinished ? "✓" : formatTime(timer.timeLeft)}
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Button
                        color={timer.isRunning ? "warning" : "primary"}
                        size="lg"
                        onPress={() => (timer.isRunning ? timer.pause() : timer.start())}
                        isDisabled={timer.timeLeft === 0 && !timer.isRunning}
                        startContent={timer.isRunning ? <Pause size={20} /> : <Play size={20} />}
                        className="min-w-32"
                      >
                        {timer.isRunning ? <Trans>Pause</Trans> : <Trans>Start</Trans>}
                      </Button>

                      <Button
                        variant="bordered"
                        size="lg"
                        onPress={timer.reset}
                        startContent={<RotateCcw size={20} />}
                      >
                        <Trans>Reset</Trans>
                      </Button>
                    </div>

                    {timer.isFinished && (
                      <div className="mt-4">
                        {isAlarmPlaying.current && (
                          <Button color="danger" size="lg" onPress={stopAlarm} className="min-w-48">
                            <Trans>Stop Alarm</Trans>
                          </Button>
                        )}
                        <p className="text-sm mt-2 text-success font-medium">
                          <Trans>Timer finished!</Trans>
                        </p>
                      </div>
                    )}

                    {!timer.isFinished && (
                      <p className="text-sm mt-4 text-gray-600 dark:text-gray-400">
                        <Trans>{step.duration} minutes</Trans>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {stepNumber === totalSteps && (
              <div className="mt-6">
                <Button
                  color="success"
                  size="lg"
                  onPress={onNext}
                  className="w-full text-lg font-semibold"
                  variant="shadow"
                >
                  <Trans>Finish Cooking</Trans>
                </Button>
                <p className="text-center text-sm mt-3 text-gray-600 dark:text-gray-400">
                  <Trans>Swipe left or tap to complete</Trans>
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
