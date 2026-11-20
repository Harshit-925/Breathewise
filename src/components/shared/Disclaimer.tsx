import React from 'react';

export const Disclaimer: React.FC = () => {
  return (
    <aside
      className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs leading-relaxed"
      aria-label="Health Disclaimer"
    >
      <div className="flex items-start gap-3">
        <span className="text-lg" aria-hidden="true">ℹ️</span>
        <div>
          <strong className="font-semibold block mb-0.5">Health & Safety Disclaimer</strong>
          <p>
            Breathewise provides general environmental wellness guidance and pollution mitigation strategies based on public air quality models. It does not provide medical advice, diagnosis, or clinical prescriptions. If you or family members experience severe shortness of breath, acute chest tightness, or respiratory distress, seek emergency medical care immediately.
          </p>
        </div>
      </div>
    </aside>
  );
};
