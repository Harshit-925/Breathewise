import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App.js';
import { AppProvider } from '../context/AppContext.js';
import { Tabs } from '../components/Navigation/Tabs.js';
import { AqiBadge } from '../components/shared/AqiBadge.js';
import { Disclaimer } from '../components/shared/Disclaimer.js';

describe('accessibility suite (WCAG 2.2 AA)', () => {
  it('App includes accessible skip-to-content link', () => {
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );
    const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('Tabs adheres to ARIA tablist/tab pattern with keyboard focus attributes', () => {
    render(
      <AppProvider>
        <Tabs />
      </AppProvider>
    );
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);
    tabs.forEach((tab) => {
      expect(tab).toHaveAttribute('aria-controls');
      expect(tab).toHaveAttribute('aria-selected');
    });
  });

  it('AqiBadge never conveys risk by color alone', () => {
    render(<AqiBadge aqi={155} />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-label');
    expect(screen.getByText('Unhealthy')).toBeInTheDocument();
    expect(screen.getByText('155')).toBeInTheDocument();
  });

  it('Disclaimer uses accessible landmark with clear label', () => {
    render(<Disclaimer />);
    const aside = screen.getByLabelText(/Health Disclaimer/i);
    expect(aside).toBeInTheDocument();
  });

  it('Main content container is accessible with proper ID for skip link target', () => {
    const { container } = render(
      <AppProvider>
        <App />
      </AppProvider>
    );
    const main = container.querySelector('#main-content');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('tabIndex', '-1');
  });
});
