import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AqiBadge } from '../components/shared/AqiBadge.js';
import { Sparkline } from '../components/shared/Sparkline.js';
import { Disclaimer } from '../components/shared/Disclaimer.js';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.js';
import { VerdictCard } from '../components/Today/VerdictCard.js';
import { AirSnapshot } from '../components/Today/AirSnapshot.js';
import { Header } from '../components/Navigation/Header.js';
import { Tabs } from '../components/Navigation/Tabs.js';
import { AppProvider } from '../context/AppContext.js';
import type { AirData } from '../types/index.js';

const mockAirData: AirData = {
  city: 'Delhi',
  pm25: 145,
  pm10: 220,
  aqi: 198,
  standard: 'epa',
  hourly: Array.from({ length: 24 }, (_, i) => ({ hour: i, pm25: 145 })),
  updatedAt: '2026-11-20T12:00:00Z',
  temperature: 22,
  windSpeed: 2.1,
};

const mockAdvice = {
  verdict: {
    level: 'unhealthy' as const,
    headline: 'Unhealthy Air Quality (AQI 198)',
    why: 'PM2.5 concentrations are significantly elevated.',
  },
  routine: [],
  indoor: [],
  alternatives: [],
  disclaimer: 'General guidance only.',
};

describe('rendering suite', () => {
  it('AqiBadge renders AQI number and category label', () => {
    render(<AqiBadge aqi={198} />);
    expect(screen.getByText('198')).toBeInTheDocument();
    expect(screen.getByText('Unhealthy')).toBeInTheDocument();
  });

  it('AqiBadge provides accessible sr-only text twin', () => {
    const { container } = render(<AqiBadge aqi={45} />);
    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toHaveTextContent('Air Quality Index 45: Good');
  });

  it('Sparkline renders inline SVG and sr-only twin', () => {
    const { container } = render(
      <Sparkline data={[10, 20, 50, 30]} ariaLabel="Daily PM2.5 trend" />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('polyline')).toBeInTheDocument();
    const srOnly = container.querySelector('.sr-only');
    expect(srOnly).toHaveTextContent('Daily PM2.5 trend');
  });

  it('Disclaimer renders health and safety warning', () => {
    render(<Disclaimer />);
    expect(screen.getByText(/Health & Safety Disclaimer/i)).toBeInTheDocument();
    expect(screen.getByText(/does not provide medical advice/i)).toBeInTheDocument();
  });

  it('LoadingSpinner renders with role="status" and aria-live="polite"', () => {
    render(<LoadingSpinner label="Custom Loading Message" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText('Custom Loading Message')).toBeInTheDocument();
  });

  it('VerdictCard renders headline and explanation', () => {
    render(<VerdictCard advice={mockAdvice} />);
    expect(screen.getByText('Unhealthy Air Quality (AQI 198)')).toBeInTheDocument();
    expect(screen.getByText('PM2.5 concentrations are significantly elevated.')).toBeInTheDocument();
  });

  it('VerdictCard renders skeleton loader when loading', () => {
    const { container } = render(<VerdictCard advice={null} loading={true} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('AirSnapshot renders city, pollutants, and weather details', () => {
    render(
      <AirSnapshot
        airData={mockAirData}
        stagnation={{ level: 'medium', score: 2, assumptions: [] }}
        whoMultiple={{ multiple: 9.7, guidelineValue: 15, assumptions: [] }}
      />
    );
    expect(screen.getByText('Delhi')).toBeInTheDocument();
    expect(screen.getByText('145')).toBeInTheDocument();
    expect(screen.getByText('220')).toBeInTheDocument();
    expect(screen.getByText('9.7x')).toBeInTheDocument();
    expect(screen.getByText(/medium/i)).toBeInTheDocument();
  });

  it('AirSnapshot displays simulation notice when isSimulation is true', () => {
    render(<AirSnapshot airData={mockAirData} isSimulation={true} />);
    expect(screen.getByText(/Simulation mode active/i)).toBeInTheDocument();
  });

  it('Header renders app brand, simulation badge, and export buttons', () => {
    render(
      <AppProvider>
        <Header isSimulation={true} />
      </AppProvider>
    );
    expect(screen.getByText('Breathewise')).toBeInTheDocument();
    expect(screen.getByText('Simulation, not live data')).toBeInTheDocument();
    expect(screen.getByTitle('Export profile and data as JSON')).toBeInTheDocument();
  });

  it('Tabs renders all 7 navigation tabs with role="tab"', () => {
    render(
      <AppProvider>
        <Tabs />
      </AppProvider>
    );
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(7);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('Header renders Sample Data badge when isMock is true and not simulating', () => {
    render(
      <AppProvider>
        <Header isMock={true} isSimulation={false} />
      </AppProvider>
    );
    expect(screen.getByText('Sample data')).toBeInTheDocument();
  });
});
