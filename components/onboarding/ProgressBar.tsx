'use client';

import { motion } from 'framer-motion';

type Props = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.max(0, Math.min(100, ((current + 1) / total) * 100));
  return (
    <div className="h-1 w-full bg-black/5 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-[#0a0a0b] to-[#4b5563]"
        initial={false}
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 0.6 }}
      />
    </div>
  );
}
