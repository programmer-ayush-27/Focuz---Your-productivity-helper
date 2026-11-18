
'use client';

import { useState, useEffect } from 'react';

import {
  Play,
  Pause,
  RotateCcw,
  Image as ImageIcon,
  Maximize,
  Bell,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

const modes = {
  Focus: 25 * 60,
  'Short Break': 5 * 60,
  'Long Break': 10 * 60,
};

const backgrounds = [
  '/bg1.jfif',
  '/bg2.jfif',
  '/bg3.jfif',
  '/bg4.jfif',
  '/bg5.jfif',
  '/bg6.jfif',
];

const confettiColors = [
  '#f87171',
  '#fbbf24',
  '#34d399',
  '#60a5fa',
  '#c084fc',
  '#fb7185',
  '#ffffff',
];

const confettiPieces = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 12) * 0.12}s`,
  color: confettiColors[i % confettiColors.length],
}));

type Mode = keyof typeof modes;

export default function Page() {
  const [bgIndex, setBgIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('Focus');
  const [timeLeft, setTimeLeft] = useState(modes.Focus);
  const [running, setRunning] = useState(false);

  const [showCelebration, setShowCelebration] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(
        Notification.permission === 'granted'
      );
    }
  }, []);

  // Enable browser notifications
  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications.');
      return;
    }

    const permission = await Notification.requestPermission();

    setNotificationsEnabled(permission === 'granted');

    if (permission === 'granted') {
      new Notification('🪷 Focuz notifications enabled!', {
        body: 'You will be notified when your sessions are completed.',
      });
    } else if (permission === 'denied') {
      alert(
        'Notifications are blocked. You can enable them in your browser settings.'
      );
    }
  };

  // Timer logic
  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  // Session completed
  useEffect(() => {
    if (timeLeft === 0) {
      setRunning(false);
      setShowCelebration(true);

      if (
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification('🎉 Session completed! | Focuz', {
          body:
            mode === 'Focus'
              ? 'Great work! You completed your focus session. Time for a break!'
              : 'Break completed! Ready for another session?',
        });
      }
    }
  }, [timeLeft, mode]);

  // Change mode
  const changeMode = (newMode: Mode) => {
    setRunning(false);
    setShowCelebration(false);
    setMode(newMode);
    setTimeLeft(modes[newMode]);
  };

  // Reset timer
  const resetTimer = () => {
    setRunning(false);
    setShowCelebration(false);
    setTimeLeft(modes[mode]);
  };

  // Change background
  const changeBackground = () => {
    setBgIndex((prev) => (prev + 1) % backgrounds.length);
  };

  // Format timer
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Fullscreen
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen unavailable:', error);
    }
  };

  return (
    <main className="relative min-h-[100svh] w-full overflow-x-hidden overflow-y-auto flex flex-col items-center px-4 text-white">

      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center blur-xs scale-105 transition-all duration-700"
        style={{
          backgroundImage: `url('${backgrounds[bgIndex]}')`,
        }}
      />

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/35" />

      {/* Header */}
      <header className="relative z-10 w-full shrink-0 text-center pt-8 sm:pt-10 px-2">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-wider">
          FOCUZ.
        </h1>

        <p
          className="max-w-xl mx-auto text-[10px] sm:text-sm text-white/70 tracking-[0.14em] sm:tracking-[0.2em] leading-relaxed mt-3 px-2"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          DISTRACTIONS CAN WAIT, BUT YOUR GOALS CAN'T.
        </p>
      </header>

      {/* Timer container */}
      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-6 sm:gap-8 p-5 sm:p-9 my-7 sm:my-auto rounded-3xl bg-black/20 backdrop-blur-xl border border-white/15 shadow-2xl">

        {/* Mode selection */}
        <div className="flex flex-wrap justify-center gap-2">
          {(Object.keys(modes) as Mode[]).map((item) => (
            <button
              key={item}
              onClick={() => changeMode(item)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-lg transition-all duration-300 ${
                mode === item
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Timer */}
        <div className="text-center w-full">
          <p className="text-7xl sm:text-9xl font-bold tracking-wider tabular-nums">
            {formattedTime}
          </p>

          <p
            className="text-white/60 text-sm sm:text-base mt-3"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            {running
              ? 'Stay focused.'
              : timeLeft === 0
                ? 'Session completed!'
                : mode === 'Focus'
                  ? 'Ready to focus?'
                  : 'Take a break.'}
          </p>
        </div>

        {/* Session status */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
          <span
            className={`w-2 h-2 rounded-full ${
              timeLeft === 0
                ? 'bg-emerald-400'
                : running
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-white/40'
            }`}
          />

          <span
            className="text-[10px] tracking-[0.2em] text-white/70"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            {timeLeft === 0
              ? 'SESSION COMPLETED'
              : running
                ? 'SESSION IN PROGRESS'
                : 'SESSION PAUSED'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setRunning(!running)}
            disabled={timeLeft === 0}
            aria-label={running ? 'Pause timer' : 'Start timer'}
            title={running ? 'Pause' : 'Start'}
            className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
          >
            {running
              ? <Pause size={26} fill="currentColor" />
              : <Play size={26} fill="currentColor" />
            }
          </button>

          <button
            onClick={resetTimer}
            aria-label="Reset timer"
            title="Reset timer"
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 hover:bg-white/25 hover:scale-105 active:scale-95 transition-all"
          >
            <RotateCcw size={22} />
          </button>
        </div>

        {/* Utility buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={changeBackground}
            aria-label="Change background"
            title="Change background"
            className="p-3 rounded-full bg-white/10 border border-white/15 hover:bg-white/25 transition-all"
          >
            <ImageIcon size={20} />
          </button>

          <button
            onClick={enableNotifications}
            aria-label="Enable notifications"
            title={
              notificationsEnabled
                ? 'Notifications enabled'
                : 'Enable notifications'
            }
            className={`p-3 rounded-full border transition-all ${
              notificationsEnabled
                ? 'bg-emerald-400/20 border-emerald-300/30 text-emerald-200'
                : 'bg-white/10 border-white/15 hover:bg-white/25'
            }`}
          >
            <Bell size={20} />
          </button>

          <button
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            title="Fullscreen"
            className="p-3 rounded-full bg-white/10 border border-white/15 hover:bg-white/25 transition-all"
          >
            <Maximize size={20} />
          </button>
        </div>

        <p
          className="text-[10px] text-white/45 text-center"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          {notificationsEnabled
            ? 'NOTIFICATIONS ENABLED'
            : 'ENABLE NOTIFICATIONS FOR SESSION ALERTS'}
        </p>
      </div>

      {/* Completion celebration */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 backdrop-blur-sm p-4">

          {/* Confetti */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                className="confetti-piece"
                style={{
                  left: piece.left,
                  backgroundColor: piece.color,
                  animationDelay: piece.delay,
                }}
              />
            ))}
          </div>

          {/* Celebration card */}
          <div className="relative z-10 w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-white/15 border border-white/25 backdrop-blur-2xl shadow-2xl text-center animate-pop">

            <button
              onClick={() => setShowCelebration(false)}
              aria-label="Close celebration"
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X size={18} />
            </button>

            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-emerald-400/20 border border-emerald-300/30 flex items-center justify-center">
                <CheckCircle2 size={48} className="text-emerald-300" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles size={18} className="text-yellow-300" />

              <span className="text-xs tracking-[0.25em] text-white/70">
                YOU DID IT!
              </span>

              <Sparkles size={18} className="text-yellow-300" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              {mode === 'Focus' ? 'Amazing work!' : 'Well refreshed!'}
            </h2>

            <p
              className="text-sm text-white/75 leading-relaxed mb-7"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              {mode === 'Focus'
                ? 'You completed your focus session. Every little step counts. Keep it up!'
                : 'Your break is complete. Take that fresh energy into your next session!'}
            </p>

            <button
              onClick={() => {
                setShowCelebration(false);
                setTimeLeft(modes[mode]);
              }}
              className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.03] active:scale-95 transition-all"
            >
              Awesome! ✨
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="relative z-10 w-full text-center mt-auto pt-2 pb-5 shrink-0"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <p className="text-xs text-white/60 tracking-widest">
          DESIGNED & DEVELOPED BY AYUSH
        </p>

        <p className="text-xs text-white/40 mt-1">
          Made with love and crafted with perfection
        </p>
      </footer>

      {/* Animations */}
      <style jsx>{`
        .confetti-piece {
          position: absolute;
          top: -20px;
          width: 9px;
          height: 15px;
          border-radius: 2px;
          animation: confetti-fall 3s ease-in forwards;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }

          100% {
            transform: translateY(110vh) rotate(900deg);
            opacity: 0;
          }
        }

        @keyframes pop {
          0% {
            opacity: 0;
            transform: scale(0.75) translateY(20px);
          }

          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-pop {
          animation: pop 0.4s ease-out;
        }
      `}</style>

    </main>
  );
}
