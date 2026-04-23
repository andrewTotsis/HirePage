'use client';

import { SortBy } from './types';

type Props = {
  packageFilter: 'all' | 'basic' | 'monthly' | 'unlimited';
  onPackageFilter: (v: 'all' | 'basic' | 'monthly' | 'unlimited') => void;
  sortBy: SortBy;
  onSort: (v: SortBy) => void;
  count: number;
};

const selCls =
  'rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 outline-none transition-colors hover:border-white/25 focus:border-white/30';

export default function FiltersBar({
  packageFilter,
  onPackageFilter,
  sortBy,
  onSort,
  count,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
        <span>{count} {count === 1 ? 'lead' : 'leads'}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          className={selCls}
          value={packageFilter}
          onChange={(e) => onPackageFilter(e.target.value as Props['packageFilter'])}
          aria-label="Filter by package"
        >
          <option value="all">All packages</option>
          <option value="basic">Basic · $50</option>
          <option value="monthly">Monthly · $5/mo</option>
          <option value="unlimited">Unlimited · $10/mo</option>
        </select>
        <select
          className={selCls}
          value={sortBy}
          onChange={(e) => onSort(e.target.value as SortBy)}
          aria-label="Sort by"
        >
          <option value="recent">Most recent</option>
          <option value="intent">Highest intent</option>
          <option value="created">First seen</option>
        </select>
      </div>
    </div>
  );
}
