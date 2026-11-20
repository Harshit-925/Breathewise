import React from 'react';
import { useApp } from './context/AppContext.js';
import { useAirData } from './hooks/useAirData.js';
import { Header } from './components/Navigation/Header.js';
import { Tabs } from './components/Navigation/Tabs.js';
import { TodayView } from './components/Today/index.js';
import { RoutineView } from './components/Routine/index.js';
import { IndoorView } from './components/Indoor/index.js';
import { AlternativesView } from './components/Alternatives/index.js';
import { ImpactView } from './components/Impact/index.js';
import { CommunityView } from './components/Community/index.js';
import { ChatView } from './components/Chat/index.js';
import { Disclaimer } from './components/shared/Disclaimer.js';
import { ErrorBoundary } from './components/shared/LoadingSpinner.js';

export const App: React.FC = () => {
  const { activeTab } = useApp();
  const { isMock, isSimulation, attribution } = useAirData();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Skip to Main Content Link for WCAG 2.2 AA */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* App Header */}
      <Header isMock={isMock} isSimulation={isSimulation} />

      {/* Main Tab Navigation */}
      <Tabs />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6" tabIndex={-1}>
        <ErrorBoundary>
          <div
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            className="focus:outline-none"
          >
            {activeTab === 'today' && <TodayView />}
            {activeTab === 'routine' && <RoutineView />}
            {activeTab === 'indoor' && <IndoorView />}
            {activeTab === 'alternatives' && <AlternativesView />}
            {activeTab === 'impact' && <ImpactView />}
            {activeTab === 'community' && <CommunityView />}
            {activeTab === 'chat' && <ChatView />}
          </div>
        </ErrorBoundary>

        {/* Persistent Health Notice */}
        <div className="mt-8">
          <Disclaimer />
        </div>
      </main>

      {/* Global Footer with Source Attribution */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Breathewise — GenAI Urban Air Quality Assistant
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {attribution} • Health Standards: US EPA & WHO Guidelines
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            LLM does language, code does math • Local-first privacy
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
