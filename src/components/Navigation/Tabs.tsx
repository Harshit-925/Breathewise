import React, { useRef } from 'react';
import { useApp, type TabId } from '../../context/AppContext.js';

interface TabItem {
  id: TabId;
  labelEn: string;
  labelHi: string;
  icon: string;
}

const TABS: TabItem[] = [
  { id: 'today', labelEn: "Today's Air", labelHi: 'आज की वायु', icon: '🌤️' },
  { id: 'routine', labelEn: 'Routine Planner', labelHi: 'दैनिक दिनचर्या', icon: '⏱️' },
  { id: 'indoor', labelEn: 'Indoor Hacks', labelHi: 'घर की हवा', icon: '🏠' },
  { id: 'alternatives', labelEn: 'Commute & Travel', labelHi: 'यात्रा विकल्प', icon: '🚲' },
  { id: 'impact', labelEn: 'Impact Meter', labelHi: 'प्रभाव मापक', icon: '📊' },
  { id: 'community', labelEn: 'Community Pledges', labelHi: 'सामुदायिक प्रतिज्ञा', icon: '🤝' },
  { id: 'chat', labelEn: 'Breathewise AI', labelHi: 'एआई सहायक', icon: '💬' },
];

export const Tabs: React.FC = () => {
  const { activeTab, setActiveTab, lang } = useApp();
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map());

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    if (e.key === 'ArrowRight') {
      newIndex = (index + 1) % TABS.length;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (index - 1 + TABS.length) % TABS.length;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = TABS.length - 1;
    } else {
      return;
    }
    e.preventDefault();
    const nextTab = TABS[newIndex];
    if (nextTab) {
      setActiveTab(nextTab.id);
      tabRefs.current.get(nextTab.id)?.focus();
    }
  };

  return (
    <nav aria-label="Main Sections" className="border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
        <div role="tablist" aria-orientation="horizontal" className="flex space-x-1 sm:space-x-2 py-2">
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            const label = lang === 'hi' ? tab.labelHi : tab.labelEn;
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.id, el);
                  else tabRefs.current.delete(tab.id);
                }}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
