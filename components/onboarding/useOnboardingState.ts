'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { initialData, OnboardingData } from './types';

const STORAGE_KEY = 'hirepage-onboarding-v1';

export function useOnboardingState() {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [hydrated, setHydrated] = useState(false);
  const initial = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData((d) => ({ ...d, ...parsed }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    if (!hydrated) return;
    try {
      const { resume, headshot, ...persistable } = data;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...persistable,
          resume: resume ? { name: resume.name, size: resume.size, type: resume.type } : undefined,
          headshot: headshot
            ? { name: headshot.name, size: headshot.size, type: headshot.type, dataUrl: headshot.dataUrl }
            : undefined,
        }),
      );
    } catch {}
  }, [data, hydrated]);

  const update = useCallback(
    <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
      setData((d) => ({ ...d, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setData(initialData);
  }, []);

  return { data, update, reset, hydrated };
}
