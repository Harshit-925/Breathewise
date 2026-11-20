import React from 'react';

interface TextTwinProps {
  visual: React.ReactNode;
  accessibleText: string;
}

export const TextTwin: React.FC<TextTwinProps> = ({ visual, accessibleText }) => {
  return (
    <span className="inline-flex items-center">
      <span aria-hidden="true">{visual}</span>
      <span className="sr-only">{accessibleText}</span>
    </span>
  );
};
