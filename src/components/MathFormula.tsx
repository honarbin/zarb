import React from 'react';
import { toPersianDigits } from '../utils/persian';

interface MathFormulaProps {
  factor1: number | string;
  factor2: number | string;
  answer?: number | string | null;
  className?: string;
  symbolColor?: string;
}

/**
 * Renders a multiplication math expression strictly Left-To-Right:
 * [Factor1] × [Factor2] = [Answer]
 * Guaranteed LTR visual rendering regardless of Persian/English digits or RTL layout inheritance.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  factor1,
  factor2,
  answer,
  className = '',
  symbolColor = '',
}) => {
  const f1Text = typeof factor1 === 'number' ? toPersianDigits(factor1) : factor1;
  const f2Text = typeof factor2 === 'number' ? toPersianDigits(factor2) : factor2;
  const ansText =
    answer !== undefined && answer !== null
      ? typeof answer === 'number'
        ? toPersianDigits(answer)
        : answer
      : null;

  return (
    <span
      dir="ltr"
      className={`math-flex inline-flex items-center gap-1.5 font-black dir-ltr ${className}`}
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
    >
      <span>{f1Text}</span>
      <span className={symbolColor || 'text-amber-500'}>×</span>
      <span>{f2Text}</span>
      {ansText !== null && (
        <>
          <span className="text-slate-400 opacity-80">=</span>
          <span>{ansText}</span>
        </>
      )}
    </span>
  );
};
