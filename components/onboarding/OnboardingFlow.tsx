'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Logo from '../Logo';
import ProgressBar from './ProgressBar';
import {
  ColorStep,
  EmailStep,
  GithubStep,
  HeadshotStep,
  LinkedInStep,
  LoadingStep,
  NameStep,
  PackageStep,
  PhoneStep,
  RequestsStep,
  ResumeUploadStep,
  ReviewStep,
  RolesStep,
  StyleStep,
  SuccessStep,
  WelcomeStep,
} from './steps';
import { OnboardingData } from './types';
import { reportProgress, useOnboardingState } from './useOnboardingState';

type StepId =
  | 'welcome'
  | 'name'
  | 'email'
  | 'phone'
  | 'roles'
  | 'linkedin'
  | 'github'
  | 'resume'
  | 'headshot'
  | 'style'
  | 'colors'
  | 'requests'
  | 'package'
  | 'review'
  | 'loading'
  | 'success';

const STEPS: StepId[] = [
  'welcome',
  'name',
  'email',
  'phone',
  'roles',
  'linkedin',
  'github',
  'resume',
  'headshot',
  'style',
  'colors',
  'requests',
  'package',
  'review',
];

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function canAdvanceFrom(step: StepId, data: OnboardingData): boolean {
  switch (step) {
    case 'name':
      return data.fullName.trim().length >= 2;
    case 'email':
      return isEmail(data.email);
    case 'roles':
      return data.roles.length > 0;
    case 'resume':
      return !!data.resume;
    case 'style':
      return !!data.style;
    case 'package':
      return !!data.plan;
    default:
      return true;
  }
}

export default function OnboardingFlow() {
  const { data, update, reset, hydrated, leadId } = useOnboardingState();
  const [stepIdx, setStepIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success'>('idle');

  const stepId = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  const canAdvance = canAdvanceFrom(stepId, data);

  useEffect(() => {
    if (!hydrated || !leadId) return;
    const t = setTimeout(() => reportProgress(leadId, stepId, data), 700);
    return () => clearTimeout(t);
  }, [hydrated, leadId, stepId, data]);

  const goNext = useCallback(() => {
    if (!canAdvance) return;
    if (isLast) {
      if (leadId) reportProgress(leadId, 'submitted', data);
      setSubmitState('loading');
      setTimeout(() => setSubmitState('success'), 3200);
      return;
    }
    setDirection(1);
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  }, [canAdvance, isLast, leadId, data]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStepIdx((i) => Math.max(i - 1, 0));
  }, []);

  const jumpTo = useCallback((id: string) => {
    const rowToStep: Record<string, StepId> = {
      name: 'name',
      email: 'email',
      phone: 'phone',
      roles: 'roles',
      linkedin: 'linkedin',
      github: 'github',
      resume: 'resume',
      headshot: 'headshot',
      style: 'style',
      colors: 'colors',
      requests: 'requests',
      package: 'package',
    };
    const target = rowToStep[id];
    if (!target) return;
    const idx = STEPS.indexOf(target);
    if (idx >= 0) {
      setDirection(-1);
      setStepIdx(idx);
    }
  }, []);

  useEffect(() => {
    if (submitState !== 'idle') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        const isSelectable = stepId === 'style' || stepId === 'colors' || stepId === 'package' || stepId === 'roles' || stepId === 'resume' || stepId === 'headshot';
        if (!isSelectable) {
          e.preventDefault();
          goNext();
        }
      } else if (e.key === 'Escape') {
        goBack();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goBack, stepId, submitState]);

  const variants = useMemo(
    () => ({
      enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
      center: { x: 0, opacity: 1 },
      exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
    }),
    [],
  );

  if (!hydrated) {
    return <div className="min-h-screen" />;
  }

  const sharedProps = { data, update, next: goNext, back: goBack, canAdvance };

  const renderStep = () => {
    switch (stepId) {
      case 'welcome': return <WelcomeStep {...sharedProps} />;
      case 'name': return <NameStep {...sharedProps} />;
      case 'email': return <EmailStep {...sharedProps} />;
      case 'phone': return <PhoneStep {...sharedProps} />;
      case 'roles': return <RolesStep {...sharedProps} />;
      case 'linkedin': return <LinkedInStep {...sharedProps} />;
      case 'github': return <GithubStep {...sharedProps} />;
      case 'resume': return <ResumeUploadStep {...sharedProps} />;
      case 'headshot': return <HeadshotStep {...sharedProps} />;
      case 'style': return <StyleStep {...sharedProps} />;
      case 'colors': return <ColorStep {...sharedProps} />;
      case 'requests': return <RequestsStep {...sharedProps} />;
      case 'package': return <PackageStep {...sharedProps} />;
      case 'review': return <ReviewStep {...sharedProps} jumpTo={jumpTo} />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-black/5 bg-white/85 backdrop-blur-md">
        <ProgressBar current={stepIdx} total={STEPS.length} />
        <div className="container-pro flex h-14 items-center justify-between">
          <Link href="/" aria-label="HirePage home" className="flex items-center">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-ink/50">
              Step {Math.min(stepIdx + 1, STEPS.length)} of {STEPS.length}
            </span>
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-sm text-ink/60 transition-colors hover:text-ink"
              onClick={() => reset()}
            >
              Exit
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="relative flex-1 overflow-hidden">
        <div className="container-pro flex min-h-[calc(100vh-3.5rem-0.25rem)] items-center justify-center py-12 md:py-16">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            {submitState === 'loading' ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <LoadingStep />
              </motion.div>
            ) : submitState === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <SuccessStep email={data.email} />
              </motion.div>
            ) : (
              <motion.div
                key={stepId}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.38 }}
                className="w-full"
              >
                {renderStep()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer nav */}
      {submitState === 'idle' && stepId !== 'welcome' && (
        <div className="sticky bottom-0 border-t border-black/5 bg-white/85 backdrop-blur-md">
          <div className="container-pro flex h-16 items-center justify-between gap-3">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink/70 transition-colors hover:text-ink"
              aria-label="Back"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="m11 18-6-6 6-6" />
              </svg>
              Back
            </button>

            <div className="flex items-center gap-3">
              {isOptional(stepId) && (
                <button
                  onClick={() => {
                    setDirection(1);
                    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
                  }}
                  className="rounded-lg px-3 py-2 text-sm text-ink/60 transition-colors hover:text-ink"
                >
                  Skip
                </button>
              )}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                disabled={!canAdvance}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>{isLast ? 'Submit' : 'Continue'}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isOptional(id: StepId) {
  return id === 'phone' || id === 'linkedin' || id === 'github' || id === 'headshot' || id === 'colors' || id === 'requests';
}
