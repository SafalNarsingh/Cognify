"use client";
import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';

export const FloatingPlayer = React.forwardRef<HTMLAudioElement, {
  track: string | null,
  pack: string | null,
  isPlaying?: boolean,
  onPlayingChange?: (playing: boolean) => void,
  onTimeUpdate?: (time: number) => void,
  onDurationChange?: (duration: number) => void,
  onClose?: () => void
}>(function FloatingPlayer(
  { 
    track, 
    pack,
    isPlaying,
    onPlayingChange,
    onTimeUpdate,
    onDurationChange,
    onClose
  },
  ref
) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  // Expose the audio element through the ref
  useImperativeHandle(ref, () => localAudioRef.current as HTMLAudioElement);

  useEffect(() => {
    if (track && localAudioRef.current) {
      localAudioRef.current.src = `/intro/${track}.mp3`;
      localAudioRef.current.load();
      
      if (isPlaying) {
        const playPromise = localAudioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error('Play error:', err);
            onPlayingChange?.(false);
          });
        }
      }
    }
  }, [track]);

  useEffect(() => {
    if (!localAudioRef.current) return;
    if (isPlaying) {
      const playPromise = localAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.error('Play error:', err);
          onPlayingChange?.(false);
        });
      }
    } else {
      localAudioRef.current.pause();
    }
  }, [isPlaying, onPlayingChange]);

  const handleTimeUpdate = () => {
    if (localAudioRef.current) {
      setCurrentTime(localAudioRef.current.currentTime);
      onTimeUpdate?.(localAudioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (localAudioRef.current) {
      setDuration(localAudioRef.current.duration);
      onDurationChange?.(localAudioRef.current.duration);
    }
  };

  const togglePlay = () => {
    onPlayingChange?.(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (localAudioRef.current) {
      localAudioRef.current.currentTime = time;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }
  };

  if (!track) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[55] w-[95%] max-w-lg"
    >
      <div className="bg-white/90 backdrop-blur-2xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] p-5 flex flex-col gap-3">
        <audio 
          ref={localAudioRef} 
          onTimeUpdate={handleTimeUpdate} 
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => onPlayingChange?.(false)}
        />
        
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-[#5F7A7B] uppercase tracking-widest truncate">{track}</p>
            <p className="text-[10px] text-gray-400 truncate font-light">{pack}</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => localAudioRef.current && (localAudioRef.current.currentTime -= 10)} 
              className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-[#5F7A7B] transition-colors text-xs font-semibold"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 14l-4-4m0 0l4-4m-4 4h13a4 4 0 010 8"/></svg>
              <span>10s</span>
            </button>

            <button 
              onClick={togglePlay} 
              className="w-12 h-12 bg-[#5F7A7B] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
            >
              {isPlaying ? (
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            <button 
              onClick={() => localAudioRef.current && (localAudioRef.current.currentTime += 10)} 
              className="flex items-center gap-1 px-3 py-2 text-gray-400 hover:text-[#5F7A7B] transition-colors text-xs font-semibold"
            >
              <span>10s</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15 14l4-4m0 0l-4-4m4 4H6a4 4 0 000 8"/></svg>
            </button>

            {onClose && (
              <button 
                onClick={onClose}
                className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="px-2 space-y-1">
          <input 
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#5F7A7B]"
          />
          <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  function formatTime(time: number) {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
});