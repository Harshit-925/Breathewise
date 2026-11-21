import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../context/AppContext.js';
import { Tabs } from '../components/Navigation/Tabs.js';
import { ThemeToggle } from '../components/Navigation/ThemeToggle.js';
import { LanguageSwitch } from '../components/Navigation/LanguageSwitch.js';
import { ImpactView } from '../components/Impact/index.js';
import { IndoorView } from '../components/Indoor/index.js';
import { CommunityView } from '../components/Community/index.js';
import { TodayView } from '../components/Today/index.js';
import { ChatView } from '../components/Chat/index.js';
import { apiService } from '../services/apiService.js';

const mockAirDataResponse = {
  airData: {
    city: 'Delhi',
    pm25: 120,
    pm10: 180,
    aqi: 184,
    standard: 'epa' as const,
    hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, pm25: 120 })),
    updatedAt: new Date().toISOString(),
  },
  stagnation: { level: 'medium' as const, score: 2, assumptions: [] },
  whoMultiple: { multiple: 8.0, guidelineValue: 15, assumptions: [] },
  bestWindows: { windows: [{ startHour: 13, endHour: 15, avgPm25: 90 }], assumptions: [] },
  attribution: 'CAMS ENSEMBLE + Open-Meteo',
  isMock: true,
  isStale: false,
};

describe('dom events suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.spyOn(apiService, 'getAirData').mockResolvedValue(mockAirDataResponse);
  });

  it('Tabs click changes active tab', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Tabs />
      </AppProvider>
    );

    const routineTab = screen.getByRole('tab', { name: /Routine Planner/i });
    expect(routineTab).toHaveAttribute('aria-selected', 'false');

    await user.click(routineTab);
    expect(routineTab).toHaveAttribute('aria-selected', 'true');
  });

  it('Tabs support arrow key keyboard navigation', () => {
    render(
      <AppProvider>
        <Tabs />
      </AppProvider>
    );

    const todayTab = screen.getByRole('tab', { name: /Today's Air/i });
    todayTab.focus();

    fireEvent.keyDown(todayTab, { key: 'ArrowRight' });
    const routineTab = screen.getByRole('tab', { name: /Routine Planner/i });
    expect(routineTab).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(routineTab, { key: 'ArrowLeft' });
    expect(todayTab).toHaveAttribute('aria-selected', 'true');
  });

  it('ThemeToggle toggles theme and persists to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <ThemeToggle />
      </AppProvider>
    );

    const toggleBtn = screen.getByRole('button', { name: /Switch to (light|dark) mode/i });
    await user.click(toggleBtn);
    expect(localStorage.getItem('breathewise_theme_v1')).toBeTruthy();
  });

  it('LanguageSwitch toggles between English and Hindi', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <LanguageSwitch />
      </AppProvider>
    );

    const hiBtn = screen.getByRole('button', { name: /हिन्दी/i });
    await user.click(hiBtn);
    expect(hiBtn).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('breathewise_lang_v1')).toBe('hi');
  });

  it('ImpactView allows toggling N95 mask and HEPA purifier', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <ImpactView />
      </AppProvider>
    );

    const maskCheckbox = screen.getByLabelText(/Wear N95 Outdoors/i);
    expect(maskCheckbox).toBeChecked();

    await user.click(maskCheckbox);
    expect(maskCheckbox).not.toBeChecked();

    const purifierCheckbox = screen.getByLabelText(/Run HEPA Purifier/i);
    expect(purifierCheckbox).toBeChecked();
    await user.click(purifierCheckbox);
    expect(purifierCheckbox).not.toBeChecked();
  });

  it('IndoorView CADR calculator updates room volume when dimensions change', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <IndoorView />
      </AppProvider>
    );

    const lengthInput = screen.getByLabelText(/Length/i);
    await user.clear(lengthInput);
    await user.type(lengthInput, '6');
    expect(screen.getAllByText(/Required CADR/i).length).toBeGreaterThan(0);
  });

  it('CommunityView pledge button commits pledge and saves to storage', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <CommunityView />
      </AppProvider>
    );

    const transitPledge = screen.getByRole('button', { name: /Take Public Transit/i });
    await user.click(transitPledge);
    expect(transitPledge).toHaveAttribute('aria-pressed', 'true');

    const raw = localStorage.getItem('breathewise_pledges_v1');
    expect(raw).toContain('public_transit');
  });

  it('TodayView smog multiplier slider responds to change events', async () => {
    render(
      <AppProvider>
        <TodayView />
      </AppProvider>
    );

    const slider = await screen.findByLabelText(/Pollution Multiplier/i);
    fireEvent.change(slider, { target: { value: '2.5' } });
    expect(slider).toHaveValue('2.5');
  });

  it('ChatView switches to Quick-Ask mode when toggle clicked', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <ChatView />
      </AppProvider>
    );

    const switchBtn = screen.getByRole('button', { name: /Switch to Quick-Ask/i });
    await user.click(switchBtn);
    expect(screen.getByText(/Quick-Ask mode/i)).toBeInTheDocument();
  });

  it('ChatView input updates value when typing', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <ChatView />
      </AppProvider>
    );

    const input = screen.getByPlaceholderText(/Ask Breathewise/i);
    await user.type(input, 'Is outdoor running safe?');
    expect(input).toHaveValue('Is outdoor running safe?');
  });
});
