import { useEffect, useRef } from "react";
import { useTimer } from "./useTimer";

export const useAlarm = (step: {
  id: string;
  description: string;
  duration?: number;
}) => {
  const isAlarmPlaying = useRef(false);
  const timer = useTimer(step.duration ? step.duration * 60 : 0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    stopAlarm();
    if (step.duration) {
      timer.setDuration(step.duration * 60);
    }
    return () => stopAlarm();
  }, [step.id, step.duration]);

  useEffect(() => {
    if (timer.isFinished && !isAlarmPlaying.current) {
      startAlarm();
    } else if (!timer.isFinished && isAlarmPlaying.current) {
      stopAlarm();
    }
  }, [timer.isFinished]);

  const playBeepSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = 880;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.4, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.6);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.6);

      navigator.vibrate?.([200, 100, 200]);
    } catch (error) {
      console.error("Audio playback failed:", error);
    }
  };

  const startAlarm = () => {
    if (isAlarmPlaying.current) return;

    isAlarmPlaying.current = true;
    playBeepSound();

    alarmIntervalRef.current = setInterval(() => {
      playBeepSound();
    }, 2000);
  };

  const stopAlarm = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
    isAlarmPlaying.current = false;
    timer.reset();
  };

  return {
    timer,
    stopAlarm,
    isAlarmPlaying
  };
};
