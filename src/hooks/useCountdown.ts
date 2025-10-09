import { useState, useEffect, useCallback } from 'react';

interface TimeLeft {
  minutes: number;
  seconds: number;
}

interface CountdownControl {
  stop: () => void;
  restart: () => void;
}

export function useCountdown(durationInSeconds: number): [CountdownControl, TimeLeft] {
  const [secondsLeft, setSecondsLeft] = useState(durationInSeconds);
  const [isRunning, setIsRunning] = useState(true);

  const stop = useCallback(() => setIsRunning(false), []);
  const restart = useCallback(() => {
    setSecondsLeft(durationInSeconds);
    setIsRunning(true);
  }, [durationInSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 0) {
          clearInterval(interval);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return [{ stop, restart }, { minutes, seconds }];
}
