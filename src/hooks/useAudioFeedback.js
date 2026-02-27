import { useCallback, useRef } from 'react';

const useAudioFeedback = () => {
  const audioCtxRef = useRef(null);

  const getAudioContext = useCallback(() => {
    try {
      if (!audioCtxRef?.current || audioCtxRef?.current?.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtxRef?.current;
    } catch {
      return null;
    }
  }, []);

  const playSuccessSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const resume = ctx?.state === 'suspended' ? ctx?.resume() : Promise.resolve();
      resume?.then(() => {
        // Two-tone ascending chime
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes?.forEach((freq, i) => {
          const osc = ctx?.createOscillator();
          const gain = ctx?.createGain();
          osc?.connect(gain);
          gain?.connect(ctx?.destination);
          osc.type = 'sine';
          osc?.frequency?.setValueAtTime(freq, ctx?.currentTime + i * 0.12);
          gain?.gain?.setValueAtTime(0, ctx?.currentTime + i * 0.12);
          gain?.gain?.linearRampToValueAtTime(0.25, ctx?.currentTime + i * 0.12 + 0.02);
          gain?.gain?.exponentialRampToValueAtTime(0.001, ctx?.currentTime + i * 0.12 + 0.35);
          osc?.start(ctx?.currentTime + i * 0.12);
          osc?.stop(ctx?.currentTime + i * 0.12 + 0.35);
        });
      })?.catch(() => {});
    } catch {
      // Silently fail
    }
  }, [getAudioContext]);

  const playErrorSound = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const resume = ctx?.state === 'suspended' ? ctx?.resume() : Promise.resolve();
      resume?.then(() => {
        // Two-tone descending buzz
        const notes = [440, 349.23]; // A4, F4
        notes?.forEach((freq, i) => {
          const osc = ctx?.createOscillator();
          const gain = ctx?.createGain();
          osc?.connect(gain);
          gain?.connect(ctx?.destination);
          osc.type = 'sawtooth';
          osc?.frequency?.setValueAtTime(freq, ctx?.currentTime + i * 0.18);
          gain?.gain?.setValueAtTime(0, ctx?.currentTime + i * 0.18);
          gain?.gain?.linearRampToValueAtTime(0.2, ctx?.currentTime + i * 0.18 + 0.02);
          gain?.gain?.exponentialRampToValueAtTime(0.001, ctx?.currentTime + i * 0.18 + 0.3);
          osc?.start(ctx?.currentTime + i * 0.18);
          osc?.stop(ctx?.currentTime + i * 0.18 + 0.3);
        });
      })?.catch(() => {});
    } catch {
      // Silently fail
    }
  }, [getAudioContext]);

  return { playSuccessSound, playErrorSound };
};

export default useAudioFeedback;
