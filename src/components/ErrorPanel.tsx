import React from 'react';
import { cls } from '../lib/utils';

export function ErrorPanel({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  if (!error) return null;
  return (
    <div
      className={cls(
        'error-panel col-span-full flex flex-col items-center justify-center rounded-xl border border-[#E53935] bg-[#FFE5E4] py-8 px-6'
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="text-3xl mb-3" aria-hidden>⚠️</div>
      <h2 className="text-sm font-semibold tracking-wide uppercase text-[#E53935] mb-2">Load Error</h2>
      <p className="text-[#7A1F1D] text-sm mb-4 text-center max-w-md">{error}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-primary text-xs px-4 py-2"
        >
          Retry
        </button>
      )}
    </div>
  );
}
