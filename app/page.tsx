'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Maximize,
  Image as ImageIcon,
  X,
  Check,
} from 'lucide-react';

const modes = {
  Focus: 25 * 60,
  'Short Break': 5 * 60,
  'Long Break': 10 * 60,
};

type Mode = keyof typeof modes;

type SavedTimer = {
  mode: Mode;
  timeLeft: number;
  running: boolean;
  endTime: number | null;
};

const STORAGE_KEY = 'focuz-timer-v3';

const backgrounds = [
  '/bg1.jfif',
  '/bg2.jfif',
  '/bg3.jfif',
  '/bg4.jfif',
  '/bg5.jfif',
  '/bg6.jfif',
];

export default function Home() {
  const [mode, setMode] = useState<Mode>('Focus');
  const [timeLeft, setTimeLeft] = useState(modes.Focus);
  const [running, setRunning] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const endTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);


  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const data: SavedTimer = JSON.parse(saved);

        if (data.mode in modes) {
          setMode(data.mode);

          if (data.running && data.endTime) {
            const remaining = Math.max(
              0,
              Math.ceil((data.endTime - Date.now()) / 1000)
            );

            if (remaining > 0) {
              endTimeRef.current = data.endTime;
              setTimeLeft(remaining);
              setRunning(true);
            } else {
              endTimeRef.current = null;
              setTimeLeft(0);
              setRunning(false);
              completedRef.current = true;
              setShowCelebration(true);
            }
          } else {
            setTimeLeft(
              Math.max(0, Math.min(data.timeLeft, modes[data.mode]))
            );
            setRunning(false);
          }
        }
      }
    } catch (error) {
      console.error('Timer restore error:', error);
      localStorage.removeItem(STORAGE_KEY);
    }

    setHydrated(true);
  }, []);


  useEffect(() => {
    if (!hydrated) return;

    const data: SavedTimer = {
      mode,
      timeLeft,
      running,
      endTime: endTimeRef.current,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Timer save error:', error);
    }
  }, [mode, timeLeft, running, hydrated]);

  const completeSession = useCallback(() => {
    if (completedRef.current) return;

    completedRef.current = true;
    endTimeRef.current = null;

    setTimeLeft(0);
    setRunning(false);
    setShowCelebration(true);

    try {
      if (
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification('FOCUZ.', {
          body:
            mode === 'Focus'
              ? 'Focus session completed. Time for a break!'
              : 'Break completed. Ready for your next session?',
        });
      }
    } catch (error) {
      console.error('Notification error:', error);
    }
  }, [mode]);

  useEffect(() => {
    if (!running || !hydrated) return;

    const updateTimer = () => {
      const endTime = endTimeRef.current;

      if (!endTime) return;

      const remaining = Math.ceil(
        (endTime - Date.now()) / 1000
      );

      if (remaining <= 0) {
        completeSession();
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer();

    const interval = window.setInterval(updateTimer, 250);

    const handleVisibility = () => {
      if (!document.hidden) updateTimer();
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [running, hydrated, completeSession]);


  const toggleTimer = () => {
    if (running) {
      const remaining = endTimeRef.current
        ? Math.max(
            0,
            Math.ceil((endTimeRef.current - Date.now()) / 1000)
          )
        : timeLeft;

      endTimeRef.current = null;
      setTimeLeft(remaining);
      setRunning(false);

      if (remaining <= 0) completeSession();

      return;
    }

    const duration = timeLeft <= 0 ? modes[mode] : timeLeft;

    completedRef.current = false;
    setShowCelebration(false);
    setTimeLeft(duration);
    endTimeRef.current = Date.now() + duration * 1000;
    setRunning(true);
  };

  
  const resetTimer = () => {
    endTimeRef.current = null;
    completedRef.current = false;

    setRunning(false);
    setTimeLeft(modes[mode]);
    setShowCelebration(false);
  };

  const changeMode = (newMode: Mode) => {
    endTimeRef.current = null;
    completedRef.current = false;

    setRunning(false);
    setShowCelebration(false);
    setMode(newMode);
    setTimeLeft(modes[newMode]);
  };

  const changeBackground = () => {
    setBackgroundIndex(
      (previous) => (previous + 1) % backgrounds.length
    );
  };

  const enableNotifications = async () => {
    try {
      if (!('Notification' in window)) {
        alert('Your browser does not support notifications.');
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        alert('Notifications were not enabled.');
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  };

  if (!hydrated) {
    return <main className="min-h-svh bg-black" />;
  }

  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-black text-white">


      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url("${backgrounds[backgroundIndex]}")`,
        }}
      />


      <div className="pointer-events-none fixed inset-0 z-1 bg-black/55 backdrop-blur-[2px]" />

      <header className="relative z-10 flex flex-col items-center px-4 pt-8 text-center sm:pt-10">
        <h1 className="title text-5xl tracking-wide sm:text-6xl">
          FOCUZ.
        </h1>

        <p
          className="mt-2 text-xs tracking-[0.2em] text-white/75 sm:text-sm"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          DISTRACTIONS CAN WAIT, BUT YOUR GOALS CAN'T;
          {/* &apos;. */}
        </p>
      </header>

      <section className="relative z-10 my-8 flex w-full flex-1 items-center justify-center px-4 sm:my-auto">
        <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-black/30 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-10">


          <div className="mb-9 flex flex-wrap justify-center gap-2 sm:gap-3">
            {(Object.keys(modes) as Mode[]).map((item) => (
              <button
                key={item}
                onClick={() => changeMode(item)}
                className={`rounded-full px-4 py-2 text-xs transition sm:px-5 sm:text-sm ${
                  mode === item
                    ? 'bg-white text-black'
                    : 'border border-white/20 bg-white/5 text-white/75 hover:bg-white/15'
                }`}
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {item}
              </button>
            ))}
          </div>


          <div className="title select-none text-7xl tracking-wider sm:text-9xl">
            {formatTime(timeLeft)}
          </div>

          <p
            className="mt-3 text-xs tracking-[0.25em] text-white/55"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            {running ? 'STAY FOCUSED' : 'READY WHEN YOU ARE'}
          </p>


          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={toggleTimer}
              aria-label={running ? 'Pause timer' : 'Start timer'}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 active:scale-95"
            >
              {running ? (
                <Pause size={25} fill="currentColor" />
              ) : (
                <Play size={25} fill="currentColor" />
              )}
            </button>

            <button
              onClick={resetTimer}
              aria-label="Reset timer"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10 transition hover:bg-white/20"
            >
              <RotateCcw size={19} />
            </button>
          </div>


          <div className="mt-9 flex flex-wrap justify-center gap-6">
            <button
              onClick={changeBackground}
              aria-label="Change background"
              className="text-white/65 transition hover:text-white"
            >
              <ImageIcon size={20} />
            </button>

            <button
              onClick={enableNotifications}
              aria-label="Enable notifications"
              className="text-white/65 transition hover:text-white"
            >
              <Check size={20} />
            </button>

            <button
              onClick={enterFullscreen}
              aria-label="Toggle fullscreen"
              className="text-white/65 transition hover:text-white"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </section>


      <footer
        className="relative z-10 mt-auto px-4 pb-6 pt-2 text-center text-white/65"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <p className="text-[10px] tracking-[0.2em] sm:text-xs">
          DESIGNED &amp; DEVELOPED BY AYUSH
        </p>

        <p className="mt-2 text-[10px] text-white/45 sm:text-xs">
          Made with love and crafted with perfection
        </p>
      </footer>


      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-zinc-950 p-8 text-center shadow-2xl sm:p-10">

            <button
              onClick={() => setShowCelebration(false)}
              aria-label="Close celebration"
              className="absolute right-5 top-5 text-white/50 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="mb-5 text-5xl">Achieve it</div>

            <h2 className="title text-4xl">
              {mode === 'Focus' ? 'SESSION COMPLETE!' : 'BREAK COMPLETE!'}
            </h2>

            <p
              className="mt-4 text-sm leading-relaxed text-white/65"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              {mode === 'Focus'
                ? 'Great work! You completed your focus session. Take a moment to recharge.'
                : 'Your break is over. You are ready for another productive session.'}
            </p>

            <button
              onClick={resetTimer}
              className="mt-8 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:scale-105"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              AWESOME!
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
