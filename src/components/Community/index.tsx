import React from 'react';
import { useApp } from '../../context/AppContext.js';
import { communityTotals } from '../../lib/engine/impact.js';
import type { PledgeActionType } from '../../types/index.js';

interface PledgeOption {
  type: PledgeActionType;
  title: string;
  desc: string;
  icon: string;
}

const PLEDGE_OPTIONS: PledgeOption[] = [
  { type: 'public_transit', title: 'Take Public Transit', desc: 'Swap car trips for metro or electric bus', icon: '🚇' },
  { type: 'carpool', title: 'Carpool & Rideshare', desc: 'Cut vehicle count on urban expressways', icon: '👥' },
  { type: 'wfh', title: 'Work From Home', desc: 'Eliminate peak-hour commuting emissions', icon: '💻' },
  { type: 'ev_switch', title: 'Adopt Electric Mobility', desc: 'Eliminate direct tailpipe fine particle smog', icon: '⚡' },
  { type: 'no_burn', title: 'Report & Prevent Open Burning', desc: 'Stop leaf, trash and biomass burning', icon: '🚫' },
  { type: 'plant_tree', title: 'Urban Canopy Planting', desc: 'Support particulate-trapping green belts', icon: '🌳' },
];

export const CommunityView: React.FC = () => {
  const { pledges, togglePledge } = useApp();

  // Baseline community mock count + user local pledges
  const effectivePledges = [
    { type: 'public_transit' as const, count: 124 },
    { type: 'carpool' as const, count: 85 },
    { type: 'wfh' as const, count: 210 },
    { type: 'no_burn' as const, count: 48 },
    ...pledges,
  ];

  const totals = communityTotals(effectivePledges);

  return (
    <div className="space-y-6">
      {/* Collective Counter Banner */}
      <section aria-labelledby="community-totals-heading" className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md">
        <h2 id="community-totals-heading" className="text-sm font-semibold uppercase tracking-wider text-emerald-100">
          Neighborhood Collective Clean Air Counter
        </h2>
        <p className="text-xs text-emerald-100 mt-1">
          When households take low-emission actions together, the collective reduction clears the airshed.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
            <span className="text-xs text-emerald-100 block">Total Active Pledges</span>
            <span className="text-3xl font-black">{totals.pledgeCount}</span>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
            <span className="text-xs text-emerald-100 block">Avoided Daily CO2e</span>
            <span className="text-3xl font-black">{totals.totalCo2eSavedKg.toFixed(1)} <span className="text-sm font-normal">kg</span></span>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
            <span className="text-xs text-emerald-100 block">Reduced Ambient PM2.5</span>
            <span className="text-3xl font-black">{totals.totalPm25ReducedUg.toLocaleString()} <span className="text-sm font-normal">µg</span></span>
          </div>
        </div>
      </section>

      {/* Pledge Choices */}
      <section aria-labelledby="make-pledge-heading" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 id="make-pledge-heading" className="text-lg font-bold">
          Take Your Household Smog Mitigation Pledge
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select actions you commit to this winter. Your pledges are saved locally on your device.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5">
          {PLEDGE_OPTIONS.map((opt) => {
            const isPledged = pledges.some((p) => p.type === opt.type);
            return (
              <button
                type="button"
                key={opt.type}
                onClick={() => togglePledge(opt.type)}
                className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isPledged
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                }`}
                aria-pressed={isPledged}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl" aria-hidden="true">{opt.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isPledged
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {isPledged ? '✓ Pledged' : '+ Commit'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{opt.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
