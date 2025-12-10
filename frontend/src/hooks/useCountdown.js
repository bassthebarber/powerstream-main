// frontend/src/hooks/useCountdown.js
// Countdown timer hook for TV scheduling and live events
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for countdown functionality
 * @param {Date|string|number} targetDate - The target date/time to count down to
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoStart - Start countdown automatically (default: true)
 * @param {Function} options.onComplete - Callback when countdown reaches zero
 * @param {number} options.interval - Update interval in ms (default: 1000)
 * @returns {Object} Countdown state and controls
 */
const useCountdown = (targetDate, options = {}) => {
  const {
    autoStart = true,
    onComplete,
    interval = 1000
  } = options;

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Update callback ref
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Calculate time remaining
  function calculateTimeLeft(target) {
    const now = new Date().getTime();
    const targetTime = new Date(target).getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      total: difference
    };
  }

  // Start countdown
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  // Pause countdown
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Reset countdown
  const reset = useCallback((newTarget) => {
    const target = newTarget || targetDate;
    setTimeLeft(calculateTimeLeft(target));
    setIsComplete(false);
    setIsRunning(autoStart);
  }, [targetDate, autoStart]);

  // Main countdown effect
  useEffect(() => {
    if (!isRunning || isComplete) {
      return;
    }

    intervalRef.current = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        setIsComplete(true);
        setIsRunning(false);
        clearInterval(intervalRef.current);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [targetDate, isRunning, isComplete, interval]);

  // Format helpers
  const formatted = {
    days: String(timeLeft.days).padStart(2, '0'),
    hours: String(timeLeft.hours).padStart(2, '0'),
    minutes: String(timeLeft.minutes).padStart(2, '0'),
    seconds: String(timeLeft.seconds).padStart(2, '0'),
    // Full formatted string
    full: `${timeLeft.days}d ${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`,
    // Short format (HH:MM:SS)
    short: `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`,
    // Clock format (MM:SS) for under 1 hour
    clock: `${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`
  };

  return {
    // Time values
    days: timeLeft.days,
    hours: timeLeft.hours,
    minutes: timeLeft.minutes,
    seconds: timeLeft.seconds,
    totalMs: timeLeft.total,
    
    // Formatted strings
    formatted,
    
    // State
    isRunning,
    isComplete,
    
    // Controls
    start,
    pause,
    reset
  };
};

export default useCountdown;



