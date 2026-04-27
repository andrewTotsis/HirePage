'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { initialData, OnboardingData } from './types';

const STORAGE_KEY = 'hirepage-onboarding-v1';
const ID_KEY = 'hirepage-onboarding-id';

function makeId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {}
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useOnboardingState() {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [hydrated, setHydrated] = useState(false);
  const [leadId, setLeadId] = useState<string>('');
  const initial = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData((d) => ({ ...d, ...JSON.parse(raw) }));
      let id = localStorage.getItem(ID_KEY);
      if (!id) {
        id = makeId();
        localStorage.setItem(ID_KEY, id);
      }
      setLeadId(id);
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
      localStorage.removeItem(ID_KEY);
    } catch {}
    setData(initialData);
  }, []);

  return { data, update, reset, hydrated, leadId };
}

/** Fire-and-forget POST to persist partial/complete progress to the admin CRM. */
export function reportProgress(
  leadId: string,
  lastStep: string,
  data: OnboardingData,
): void {
  if (!leadId) return;
  const payload = {
    id: leadId,
    last_step: lastStep,
    name: data.fullName,
    email: data.email,
    phone: data.phoneNumber,
    phone_country: data.phoneCountry,
    role: data.roles,
    showcase: data.showcase,
    linkedin: data.linkedin,
    github: data.github,
    resume_name: data.resume?.name,
    resume_size: data.resume?.size,
    headshot_name: data.headshot?.name,
    style: data.style,
    colors: data.colors,
    custom_requests: data.customRequests,
    package: data.plan,
  };
  try {
    const body = JSON.stringify(payload);
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon('/api/leads/upsert', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/leads/upsert', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {}
}
