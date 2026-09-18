'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';
import { MotionValue } from 'motion/react';

export function useActiveAudience(
  progress: MotionValue<number>,
  containerRef: RefObject<HTMLDivElement | null>,
  totalSegments = 4,
  reduced = false
) {
  const [active, setActive] = useState(0);

  // Calculate active index with hysteresis
  useEffect(() => {
    if (reduced) return;

    let lastIndex = 0;
    const unsubscribe = progress.on('change', (v) => {
      const segmentSize = 1 / totalSegments;
      const rawIndex = v / segmentSize;
      const floorIndex = Math.floor(rawIndex);
      const frac = rawIndex - floorIndex;

      let newIndex = lastIndex;

      // Hysteresis threshold of 0.02
      if (floorIndex > lastIndex && frac >= 0.02) {
        newIndex = Math.min(totalSegments - 1, floorIndex);
      } else if (floorIndex < lastIndex && frac <= 0.98) {
        newIndex = Math.max(0, floorIndex);
      }

      if (newIndex !== lastIndex) {
        lastIndex = newIndex;
        setActive(newIndex);
      }
    });

    return () => unsubscribe();
  }, [progress, totalSegments, reduced]);

  const scrollToIndex = useCallback(
    (index: number) => {
      setActive(index);
      if (typeof window === 'undefined' || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const containerTop = rect.top + scrollTop;
      const totalScrollableHeight = containerRef.current.offsetHeight - window.innerHeight;

      if (totalScrollableHeight <= 0) return;

      const targetScroll = containerTop + (index / totalSegments + 0.03) * totalScrollableHeight;

      window.scrollTo({
        top: targetScroll,
        behavior: reduced ? 'auto' : 'smooth',
      });
    },
    [containerRef, totalSegments, reduced]
  );

  return { active, setActive, scrollToIndex };
}

export default useActiveAudience;
