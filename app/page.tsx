
'use client';

import { useState, useEffect } from 'react';

import {
  Play,
  Pause,
  RotateCcw,
  Image as ImageIcon,
  Maximize,
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

type Mode = keyof typeof modes;

export default function Page() {
  const [bgIndex, setBgIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('Focus');
  const [timeLeft, setTimeLeft] = useState(modes.Focus);
  const [running, setRunning] = useState(false);

  // Timer logic
  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  // Stop timer at zero
  useEffect(() => {
    if (timeLeft === 0) {
      setRunning(false);
    }
  }, [timeLeft]);

  // Change mode
  const changeMode = (newMode: Mode) => {
    setRunning(false);
    setMode(newMode);
    setTimeLeft(modes[newMode]);
  };

  // Reset timer
  const resetTimer = () => {
    setRunning(false);
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
    <main className="relative min-h-screen w-full overflow-hidden flex justify-center items-center text-white">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-xs scale-105 transition-all duration-700"
        style={{
          backgroundImage: `url('${backgrounds[bgIndex]}')`,
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Header */}
      <header className="absolute top-8 sm:top-10 left-0 w-full text-center z-10">
        <h1 className="text-5xl font-bold tracking-wider">
          Focuz.
        </h1>

        <p
          className="text-xs sm:text-sm text-white/65 tracking-[0.25em] mt-2"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          DISTRACTIONS CAN WAIT, BUT YOUR GOALS CAN'T.
        </p>
      </header>

      {/* Timer container */}
      <div className="relative z-10 w-[90%] max-w-lg flex flex-col items-center gap-7 sm:gap-8 p-6 sm:p-9 rounded-3xl bg-black/20 backdrop-blur-xl border border-white/15 shadow-2xl">

        {/* Mode selection */}
        <div className="flex flex-wrap justify-center gap-2">
          {(Object.keys(modes) as Mode[]).map((item) => (
            <button
              key={item}
              onClick={() => changeMode(item)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-base sm:text-lg transition-all duration-300 ${
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

        {/* Session status indicator */}
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

          {/* Start / Pause */}
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

          {/* Reset */}
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
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            title="Fullscreen"
            className="p-3 rounded-full bg-white/10 border border-white/15 hover:bg-white/25 transition-all"
          >
            <Maximize size={20} />
          </button>
        </div>
      </div>

      {/* Credits */}
      <footer
        className="fixed bottom-5 left-0 w-full text-center z-10"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        <p className="text-xs text-white/60 tracking-widest">
          DESIGNED & DEVELOPED BY AYUSH
        </p>

        <p className="text-xs text-white/40 mt-1">
          Made with passion © 2026
        </p>
      </footer>

    </main>
  );
}
