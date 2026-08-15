import React from 'react';
import { toPersianDigits } from '../utils/persian';

interface MathFormulaProps {
  factor1: number | string;
  factor2: number | string;
  answer?: number | string | null;
  className?: string;
  symbolColor?: string;
  size?: 'small' | 'normal' | 'large' | 'display';
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
  size = 'normal',
}) => {
  const f1Text = typeof factor1 === 'number' ? toPersianDigits(factor1) : factor1;
  const f2Text = typeof factor2 === 'number' ? toPersianDigits(factor2) : factor2;
  const ansText =
    answer !== undefined && answer !== null
      ? typeof answer === 'number'
        ? toPersianDigits(answer)
        : answer
      : null;

  let sizeClass = 'typo-math';
  if (size === 'small') sizeClass = 'typo-caption';
  if (size === 'large') sizeClass = 'typo-math-large';
  if (size === 'display') sizeClass = 'typo-display';

  return (
    <span
      dir="ltr"
      className={`math-expression math-flex inline-flex items-center gap-2.5 font-black dir-ltr ${sizeClass} ${className}`}
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
    >
      <span>{f1Text}</span>
      <span className={`${symbolColor || 'text-amber-500'} mx-0.5`}>×</span>
      <span>{f2Text}</span>
      {ansText !== null && (
        <>
          <span className="text-slate-400 opacity-80 mx-0.5">=</span>
          <span>{ansText}</span>
        </>
      )}
    </span>
  );
};
