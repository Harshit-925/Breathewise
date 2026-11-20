import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App.js';
import { AppProvider } from '../context/AppContext.js';
import { storageService } from '../services/storageService.js';

describe('end-to-end user journey', () => {
  beforeEach(() => {
    storageService.clearAll();
  });

  it('completes the full flow: check air -> navigate tabs -> customize impact -> pledge -> export & clear data', async () => {
    const user = userEvent.setup();

    // 1. Initial render
    render(
      <AppProvider>
        <App />
      </AppProvider>
    );

    // Verify Today view is initially active
    expect(screen.getByRole('tab', { name: /Today's Air/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Breathewise/i })).toBeInTheDocument();

    // 2. Navigate to Indoor Hacks
    const indoorTab = screen.getByRole('tab', { name: /Indoor Hacks/i });
    await user.click(indoorTab);
    expect(screen.getByText(/Clean Air Delivery Rate \(CADR\) & Decay Calculator/i)).toBeInTheDocument();

    // 3. Navigate to Commute Alternatives
    const altTab = screen.getByRole('tab', { name: /Commute & Travel/i });
    await user.click(altTab);
    expect(screen.getByText(/Transport Mode Comparison/i)).toBeInTheDocument();

    // 4. Navigate to Impact Meter and toggle choices
    const impactTab = screen.getByRole('tab', { name: /Impact Meter/i });
    await user.click(impactTab);
    expect(screen.getByText(/Personal Exposure & Emission Impact Meter/i)).toBeInTheDocument();

    const maskCheckbox = screen.getByLabelText(/Wear N95 Outdoors/i);
    expect(maskCheckbox).toBeChecked();
    await user.click(maskCheckbox);
    expect(maskCheckbox).not.toBeChecked();

    // 5. Navigate to Community and make a pledge
    const communityTab = screen.getByRole('tab', { name: /Community Pledges/i });
    await user.click(communityTab);
    expect(screen.getByText(/Neighborhood Collective Clean Air Counter/i)).toBeInTheDocument();

    const carpoolPledge = screen.getByRole('button', { name: /Carpool & Rideshare/i });
    await user.click(carpoolPledge);
    expect(carpoolPledge).toHaveAttribute('aria-pressed', 'true');

    // Verify data persisted to storage
    const storedPledges = storageService.getPledges();
    expect(storedPledges.some((p) => p.type === 'carpool')).toBe(true);

    // 6. Test Export JSON
    const exportBtn = screen.getByTitle('Export profile and data as JSON');
    expect(exportBtn).toBeInTheDocument();

    // 7. Test Clear Data
    storageService.clearAll();
    expect(storageService.getPledges()).toEqual([]);
  });
});
